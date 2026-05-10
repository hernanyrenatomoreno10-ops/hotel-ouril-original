import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Utensils, Bell, Cpu, Menu as MenuIcon,
  Users, BedDouble, AlertTriangle, Activity, Thermometer, Lightbulb,
  Power, Plus, Image as ImageIcon, Calendar, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";

type TabId = "overview" | "cms" | "orders" | "rooms";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "cms", label: "Conteúdo", icon: Utensils },
  { id: "orders", label: "Pedidos", icon: Bell },
  { id: "rooms", label: "Quartos", icon: Cpu },
];

/* ───────── Mock data ───────── */
const metrics = [
  { label: "Hóspedes online", value: "47", icon: Users, hint: "+6 nas últimas 2h" },
  { label: "Ocupação", value: "82%", icon: BedDouble, hint: "41 de 50 suítes" },
  { label: "Alertas ativos", value: "3", icon: AlertTriangle, hint: "1 crítico" },
  { label: "Resposta média", value: "4m 12s", icon: Activity, hint: "Meta: < 6 min" },
];

const mockOrders = [
  { id: 1, room: "204", item: "Polvo à Lagareiro", type: "Restaurante", mins: 3, price: 24 },
  { id: 2, room: "112", item: "Toalhas extra (x2)", type: "Conforto", mins: 7, price: 0 },
  { id: 3, room: "305", item: "Garrafa de água", type: "Conforto", mins: 1, price: 2.5 },
  { id: 4, room: "418", item: "Massagem relaxante", type: "SPA", mins: 12, price: 65 },
  { id: 5, room: "207", item: "Café expresso (x3)", type: "Conforto", mins: 5, price: 6 },
  { id: 6, room: "501", item: "Cataplana de marisco", type: "Restaurante", mins: 9, price: 38 },
];

const mockRooms = Array.from({ length: 12 }, (_, i) => ({
  number: `${100 + i * 13}`.slice(0, 3),
  occupied: i % 4 !== 0,
  ac: i % 3 !== 0,
  temp: 21 + (i % 5),
  lights: [80, 40, 0, 100, 60, 20][i % 6],
}));

/* ───────── Reusable UI ───────── */
const GlowCard = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn(
    "relative rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl p-5",
    "shadow-[0_0_0_1px_hsl(var(--primary)/0.06),0_0_40px_-12px_hsl(var(--primary)/0.45)]",
    "transition-shadow hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_0_60px_-10px_hsl(var(--primary)/0.6)]",
    className,
  )}>
    {children}
  </div>
);

const NavItem = ({
  tab, active, onClick, compact,
}: { tab: typeof tabs[number]; active: boolean; onClick: () => void; compact?: boolean }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
        compact ? "flex-col gap-1 px-2 py-2 text-[10px]" : "",
        active
          ? "bg-primary/10 text-primary border border-primary/40 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.7)] [text-shadow:0_0_8px_hsl(var(--primary)/0.6)]"
          : "text-muted-foreground hover:text-foreground hover:bg-card/70 border border-transparent",
      )}
    >
      <Icon className={cn(
        "h-4 w-4 transition-all",
        active && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.9)]",
      )} />
      <span className={cn(compact && "leading-none")}>{tab.label}</span>
    </button>
  );
};

/* ───────── Sections ───────── */
const OverviewSection = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <GlowCard key={m.label}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{m.label}</p>
              <Icon className="h-4 w-4 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]" />
            </div>
            <p className="font-display text-3xl mt-3 text-foreground">{m.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{m.hint}</p>
          </GlowCard>
        );
      })}
    </div>

    <div className="grid lg:grid-cols-3 gap-4">
      <GlowCard className="lg:col-span-2">
        <h3 className="font-display text-lg mb-1">Atividade em tempo real</h3>
        <p className="text-xs text-muted-foreground mb-4">Últimas 24h — placeholder</p>
        <div className="h-48 grid grid-cols-12 gap-1.5 items-end">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}
              className="rounded-t bg-gradient-to-t from-primary/70 to-primary/20 shadow-[0_0_10px_-2px_hsl(var(--primary)/0.6)]"
              style={{ height: `${20 + ((i * 37) % 80)}%` }} />
          ))}
        </div>
      </GlowCard>
      <GlowCard>
        <h3 className="font-display text-lg mb-3">Alertas</h3>
        <ul className="space-y-2 text-sm">
          {[
            { t: "Quarto 305 — temperatura alta", c: "text-destructive" },
            { t: "Receção: turno em 30min", c: "text-primary" },
            { t: "SPA: agenda 95% ocupada", c: "text-muted-foreground" },
          ].map((a, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-card/40 px-3 py-2 border border-border/40">
              <span className={cn("h-1.5 w-1.5 rounded-full", a.c.replace("text-", "bg-"))} />
              <span className={a.c}>{a.t}</span>
            </li>
          ))}
        </ul>
      </GlowCard>
    </div>
  </div>
);

const CmsSection = () => (
  <div className="grid lg:grid-cols-2 gap-5">
    <GlowCard>
      <h3 className="font-display text-lg flex items-center gap-2">
        <Utensils className="h-4 w-4 text-primary" /> Menu do Restaurante
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Atualize o prato do dia.</p>
      <div className="space-y-3">
        <div>
          <Label>Nome do prato</Label>
          <Input placeholder="Ex: Polvo à Lagareiro" />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea rows={3} placeholder="Ingredientes e história do prato…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Preço (€)</Label>
            <Input type="number" placeholder="24" />
          </div>
          <div>
            <Label>Disponibilidade</Label>
            <div className="h-10 flex items-center gap-2 rounded-md border border-input px-3">
              <Switch defaultChecked />
              <span className="text-xs text-muted-foreground">Visível no app</span>
            </div>
          </div>
        </div>
        <Button className="w-full">Publicar atualização</Button>
      </div>
    </GlowCard>

    <GlowCard>
      <h3 className="font-display text-lg flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" /> Eventos do Hotel
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Programe experiências e divulgue no app.</p>
      <div className="space-y-3">
        {[
          { t: "Noite de Morna ao vivo", d: "Hoje · 21h00 · Bar" },
          { t: "Workshop de cocktails", d: "Sex · 18h30 · Lounge" },
          { t: "Brunch no terraço", d: "Dom · 10h00 · Rooftop" },
        ].map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 p-3">
            <div>
              <p className="text-sm">{e.t}</p>
              <p className="text-[11px] text-muted-foreground">{e.d}</p>
            </div>
            <Button size="sm" variant="ghost" className="text-primary"><ImageIcon className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" /> Novo evento
        </Button>
      </div>
    </GlowCard>
  </div>
);

const OrdersSection = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-display text-lg">Pedidos ativos</h3>
      <span className="text-[11px] text-muted-foreground">{mockOrders.length} em curso</span>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockOrders.map((o) => (
        <GlowCard key={o.id}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Quarto {o.room}</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border",
              o.mins > 8 ? "border-destructive/40 text-destructive bg-destructive/10"
                         : "border-primary/40 text-primary bg-primary/10",
            )}>{o.mins} min</span>
          </div>
          <p className="font-display text-base">{o.item}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{o.type}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-foreground/80">{o.price > 0 ? `€ ${o.price.toFixed(2)}` : "Cortesia"}</span>
            <Button size="sm" className="h-7">Aceitar</Button>
          </div>
        </GlowCard>
      ))}
    </div>
  </div>
);

const RoomsSection = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-display text-lg">Controlo de quartos</h3>
      <span className="text-[11px] text-muted-foreground">{mockRooms.filter(r => r.occupied).length} ocupados</span>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {mockRooms.map((r) => (
        <GlowCard key={r.number}>
          <div className="flex items-center justify-between">
            <p className="font-display text-lg">Suíte {r.number}</p>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full",
              r.occupied ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}>{r.occupied ? "Ocupado" : "Livre"}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center border border-border/40">
              <Thermometer className="h-3.5 w-3.5 text-primary" />
              <span className="mt-1">{r.temp}°</span>
            </div>
            <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center border border-border/40">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <span className="mt-1">{r.lights}%</span>
            </div>
            <div className="rounded-lg bg-card/60 p-2 flex flex-col items-center border border-border/40">
              <Power className={cn("h-3.5 w-3.5", r.ac ? "text-primary" : "text-muted-foreground")} />
              <span className="mt-1">{r.ac ? "AC ON" : "AC OFF"}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 border-primary/30 text-primary hover:bg-primary/10">
            Abrir controlos
          </Button>
        </GlowCard>
      ))}
    </div>
  </div>
);

/* ───────── Page ───────── */
const AdminCommandCenter = () => {
  const [active, setActive] = useState<TabId>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const SidebarInner = ({ compactBottom }: { compactBottom?: boolean }) => (
    <>
      <div className="px-5 py-6 flex items-center gap-3 border-b border-border/40">
        <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/40 grid place-items-center shadow-[0_0_18px_-4px_hsl(var(--primary)/0.8)]">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Ouril</p>
          <p className="font-display text-sm font-semibold">Command Center</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((t) => (
          <NavItem key={t.id} tab={t} active={active === t.id}
            onClick={() => { setActive(t.id); setMobileNavOpen(false); }} />
        ))}
      </nav>
    </>
  );

  return (
    <div className="dark min-h-screen bg-slate-950 text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl">
        <SidebarInner />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-border/40 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-primary">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-slate-950 border-border/40 p-0">
                <SidebarInner />
              </SheetContent>
            </Sheet>
            <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/40 px-3 py-1.5 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              </span>
              <span>Servidores online</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {tabs.find((t) => t.id === active)?.label}
          </p>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {active === "overview" && <OverviewSection />}
              {active === "cms" && <CmsSection />}
              {active === "orders" && <OrdersSection />}
              {active === "rooms" && <RoomsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/40 bg-slate-950/90 backdrop-blur-xl px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((t) => (
            <NavItem key={t.id} tab={t} active={active === t.id}
              onClick={() => setActive(t.id)} compact />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminCommandCenter;