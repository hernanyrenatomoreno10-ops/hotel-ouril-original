import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Utensils, Cpu, Bell, Settings, ShieldCheck, LogOut,
  Activity, Users, Thermometer, Power, Lightbulb, CheckCircle2, Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Section = "dashboard" | "restaurant" | "automation" | "orders" | "settings";

const nav: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "restaurant", label: "Restaurante", icon: Utensils },
  { id: "automation", label: "Automação", icon: Cpu },
  { id: "orders", label: "Pedidos", icon: Bell },
  { id: "settings", label: "Configurações", icon: Settings },
];

const GlowCard = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn(
    "relative rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl p-5",
    "shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_0_40px_-10px_hsl(var(--primary)/0.35)]",
    className,
  )}>{children}</div>
);

const AdminCommandCenter = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [activeGuests, setActiveGuests] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [content, setContent] = useState<any>({ title: "", description: "", price_eur: 0, image_url: "" });
  const [featured, setFeatured] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Initial load
  useEffect(() => {
    (async () => {
      const [{ count }, ord, svc, rm, dish, feat] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("gastronomy_orders").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("service_requests").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("room_settings").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("hotel_content").select("*").eq("key", "dish_of_the_day").maybeSingle(),
        supabase.from("hotel_content").select("*").eq("key", "featured_image").maybeSingle(),
      ]);
      setActiveGuests(count ?? 0);
      setOrders(ord.data ?? []);
      setServices(svc.data ?? []);
      setRooms(rm.data ?? []);
      if (dish.data) setContent({
        title: dish.data.title ?? "", description: dish.data.description ?? "",
        price_eur: dish.data.price_eur ?? 0, image_url: dish.data.image_url ?? "",
      });
      if (feat.data) setFeatured(feat.data.image_url ?? "");
    })();
  }, []);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("admin-cc")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, (p) => {
        setServices((prev) => {
          const next = [...prev];
          const idx = next.findIndex((x) => x.id === (p.new as any)?.id);
          if (p.eventType === "INSERT") next.unshift(p.new as any);
          else if (p.eventType === "UPDATE" && idx >= 0) next[idx] = p.new as any;
          else if (p.eventType === "DELETE" && idx >= 0) next.splice(idx, 1);
          return next.slice(0, 50);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "gastronomy_orders" }, (p) => {
        setOrders((prev) => {
          const next = [...prev];
          const idx = next.findIndex((x) => x.id === (p.new as any)?.id);
          if (p.eventType === "INSERT") next.unshift(p.new as any);
          else if (p.eventType === "UPDATE" && idx >= 0) next[idx] = p.new as any;
          return next.slice(0, 50);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Hourly chart
  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}h`, pedidos: 0 }));
    [...orders, ...services].forEach((r) => {
      const h = new Date(r.created_at).getHours();
      buckets[h].pedidos += 1;
    });
    return buckets;
  }, [orders, services]);

  const totalRevenue = useMemo(() =>
    orders.reduce((s, o) => s + Number(o.price ?? 0), 0) +
    services.reduce((s, o) => s + Number(o.price ?? 0), 0),
    [orders, services],
  );

  const saveDishOfDay = async () => {
    setSaving(true);
    const { error } = await supabase.from("hotel_content").update({
      title: content.title, description: content.description,
      price_eur: content.price_eur, image_url: content.image_url, updated_at: new Date().toISOString(),
    }).eq("key", "dish_of_the_day");
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Prato do dia atualizado.");
  };

  const saveFeatured = async () => {
    const { error } = await supabase.from("hotel_content").update({
      image_url: featured, updated_at: new Date().toISOString(),
    }).eq("key", "featured_image");
    if (error) toast.error(error.message); else toast.success("Imagem de destaque atualizada.");
  };

  const markDelivered = async (id: string) => {
    const { error } = await supabase.from("service_requests").update({ status: "delivered" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Pedido marcado como entregue.");
  };

  const safetyReset = async (room: any) => {
    const { error } = await supabase.from("room_settings").insert({
      user_id: room.user_id, ac_power: false, lights_level: 0,
      blinds_level: room.blinds_level ?? 0, temperature: room.temperature ?? 22,
    });
    if (error) toast.error(error.message); else toast.success(`Reset de segurança aplicado.`);
  };

  const openServices = services.filter((s) => s.status !== "delivered" && s.status !== "done");

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/40 bg-card/40 backdrop-blur-xl">
        <div className="px-5 py-6 flex items-center gap-3 border-b border-border/40">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Ouril</p>
            <p className="font-display text-sm font-semibold">Command Center</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSection(id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                section === id
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
              )}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/40 space-y-2">
          <NavLink to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-2">
            ← App do hóspede
          </NavLink>
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top status bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/40 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-foreground/90">Servidores Online</span>
            </span>
            <span className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px]">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{activeGuests} hóspedes ativos</span>
            </span>
            <span className="hidden sm:flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px]">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>{openServices.length} pedidos abertos</span>
            </span>
          </div>
          {/* Mobile section selector */}
          <select value={section} onChange={(e) => setSection(e.target.value as Section)}
            className="md:hidden bg-card border border-border rounded-lg text-xs px-2 py-1.5">
            {nav.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <span className="hidden md:inline text-[11px] text-muted-foreground truncate max-w-[200px]">{user?.email ?? "Staff"}</span>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {section === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlowCard>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Receita extra</p>
                  <p className="font-display text-2xl mt-1">€ {totalRevenue.toFixed(2)}</p>
                </GlowCard>
                <GlowCard>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pedidos hoje</p>
                  <p className="font-display text-2xl mt-1">{orders.length + services.length}</p>
                </GlowCard>
                <GlowCard>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Em aberto</p>
                  <p className="font-display text-2xl mt-1 text-primary">{openServices.length}</p>
                </GlowCard>
                <GlowCard>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Hóspedes</p>
                  <p className="font-display text-2xl mt-1">{activeGuests}</p>
                </GlowCard>
              </div>
              <GlowCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg">Volume de pedidos por hora</h3>
                  <span className="text-[11px] text-muted-foreground">Últimas 24h</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlowCard>
            </motion.div>
          )}

          {section === "restaurant" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-5">
              <GlowCard>
                <h3 className="font-display text-lg flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" /> Prato do Dia</h3>
                <p className="text-xs text-muted-foreground mb-4">Atualiza ao vivo no app do hóspede.</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dish-title">Nome</Label>
                    <Input id="dish-title" value={content.title}
                      onChange={(e) => setContent({ ...content, title: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="dish-desc">Descrição</Label>
                    <Textarea id="dish-desc" rows={3} value={content.description}
                      onChange={(e) => setContent({ ...content, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dish-price">Preço (€)</Label>
                      <Input id="dish-price" type="number" step="0.5" value={content.price_eur}
                        onChange={(e) => setContent({ ...content, price_eur: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label htmlFor="dish-img">URL imagem</Label>
                      <Input id="dish-img" placeholder="https://…" value={content.image_url}
                        onChange={(e) => setContent({ ...content, image_url: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={saveDishOfDay} disabled={saving} className="w-full">
                    {saving ? "A guardar…" : "Publicar no app"}
                  </Button>
                </div>
              </GlowCard>

              <GlowCard>
                <h3 className="font-display text-lg flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Imagem de Destaque</h3>
                <p className="text-xs text-muted-foreground mb-4">Fotos de eventos, ginásio, SPA…</p>
                <div className="space-y-3">
                  <Input placeholder="Cole a URL da imagem"
                    value={featured} onChange={(e) => setFeatured(e.target.value)} />
                  {featured && (
                    <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                      <img src={featured} alt="Preview do destaque" className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget.style.display = "none"))} />
                    </div>
                  )}
                  <Button onClick={saveFeatured} variant="secondary" className="w-full">Guardar destaque</Button>
                </div>
              </GlowCard>
            </motion.div>
          )}

          {section === "orders" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Menu de Conforto — Pedidos ativos
              </h3>
              {openServices.length === 0 ? (
                <GlowCard className="text-center text-sm text-muted-foreground">Nenhum pedido aberto.</GlowCard>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {openServices.map((s) => {
                    const mins = Math.max(0, Math.floor((Date.now() - new Date(s.created_at).getTime()) / 60000));
                    return (
                      <GlowCard key={s.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-wider text-primary">Quarto {s.room_number ?? "—"}</span>
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-full",
                            mins > 10 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary")}>
                            {mins} min
                          </span>
                        </div>
                        <p className="font-display text-base">{s.service_type}</p>
                        {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                        {Number(s.price) > 0 && <p className="text-xs mt-1">€ {Number(s.price).toFixed(2)}</p>}
                        <Button onClick={() => markDelivered(s.id)} className="w-full mt-3" size="sm">
                          <CheckCircle2 className="h-4 w-4" /> Marcar como entregue
                        </Button>
                      </GlowCard>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {section === "automation" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" /> Automação dos Quartos
              </h3>
              {rooms.length === 0 ? (
                <GlowCard className="text-center text-sm text-muted-foreground">Sem dados de automação.</GlowCard>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.slice(0, 12).map((r) => (
                    <GlowCard key={r.id}>
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg">Quarto {r.user_id?.slice(0, 4) ?? "—"}</p>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full",
                          r.ac_power ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                          AC {r.ac_power ? "ON" : "OFF"}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center">
                          <Thermometer className="h-3.5 w-3.5 text-primary" />
                          <span className="mt-1">{r.temperature ?? "—"}°</span>
                        </div>
                        <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center">
                          <Lightbulb className="h-3.5 w-3.5 text-primary" />
                          <span className="mt-1">{r.lights_level ?? 0}%</span>
                        </div>
                        <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center">
                          <Power className="h-3.5 w-3.5 text-primary" />
                          <span className="mt-1">{r.blinds_level ?? 0}%</span>
                        </div>
                      </div>
                      <Button onClick={() => safetyReset(r)} variant="outline" size="sm" className="w-full mt-3">
                        Reset de segurança
                      </Button>
                    </GlowCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {section === "settings" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <GlowCard>
                <h3 className="font-display text-lg mb-2">Configurações</h3>
                <p className="text-sm text-muted-foreground">
                  Sessão: <span className="text-foreground">{user?.email ?? "—"}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Permissões avançadas, integrações PMS e gestão de equipa em breve.
                </p>
              </GlowCard>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCommandCenter;