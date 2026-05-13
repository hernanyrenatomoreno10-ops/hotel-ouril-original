import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, KeyRound, Sparkles, Wine, Waves, Sun, Moon, MapPin, ArrowUpRight, SlidersHorizontal, Stethoscope, BellOff, Brush, Phone, Droplets, Snowflake, Coffee, Dumbbell } from "lucide-react";
import AppShell from "@/components/AppShell";
import LivingContext from "@/components/LivingContext";
import LiveOrders from "@/components/LiveOrders";
import heroImg from "@/assets/ouril-facade.webp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useDayPhase, phaseClass, phaseGreeting } from "@/lib/context";
import { FadeUp } from "@/components/Motion";
import { ReservationSkeleton } from "@/components/Skeleton";
import { motion } from "framer-motion";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { useHotel } from "@/components/HotelProvider";

const Index = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { activeHotel, hotels, setActiveHotel } = useHotel();
  const phase = useDayPhase();
  const greeting = phaseGreeting(phase);
  const isNight = phase === "night" || phase === "evening";

  // Quarto vem da metadata da sessão (gravado no signup do PIN)
  const roomNumber = (user?.user_metadata as any)?.room_number ?? "412";
  const userName = "Hóspede Suite " + roomNumber;
  const displayName = `Suite ${roomNumber}`;

  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState<"none" | "dnd" | "makeup">("none");
  const [pratoDoDia, setPratoDoDia] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: bookingData }, { data: contentData }] = await Promise.all([
          supabase.from('bookings').select('*, hotels(name)').limit(1).maybeSingle(),
          supabase.from('hotel_content' as any).select('*').eq('key', 'prato_do_dia').maybeSingle()
        ]);
        
        if (bookingData) setCurrentBooking({ ...bookingData, hotel_name: (bookingData as any).hotels?.name });
        if (contentData && contentData.value) setPratoDoDia(contentData.value);
      } catch (err) { console.warn(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const togglePrivacy = (mode: "dnd" | "makeup") => {
    haptic("tap");
    setPrivacy(p => p === mode ? "none" : mode);
    toast.success(mode === "dnd" ? "Não Incomodar activado" : "Pedido de arrumação enviado", { duration: 1800 });
  };

  const expressOrder = async (label: string, price: number) => {
    haptic("success");
    if (user?.id) {
      await supabase.from("service_requests").insert({
        user_id: user.id,
        service_type: "Room Service Express",
        description: label,
        price,
        room_number: roomNumber,
      });
    }
    toast.success(`${label} a caminho da Suite ${roomNumber}`, {
      description: price > 0 ? `+ ${price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })} na conta` : "Cortesia da casa",
    });
    window.dispatchEvent(new CustomEvent("mh:account-update"));
  };

  return (
    <AppShell>
      <div className={`${phaseClass(phase)} pointer-events-none fixed inset-x-0 top-0 h-[60vh] ctx-tint -z-0`} />

      {/* Hero compacto */}
      <header className="relative h-[58vh] min-h-[440px] w-full overflow-hidden">
        <img src={heroImg} alt="Ouril Mindelo Hotel" className="absolute inset-0 h-full w-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-hero" />

        <div className="relative z-10 flex h-full flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-background border border-primary/40 grid place-items-center shadow-glow">
                <span className="font-display text-base font-bold bg-gradient-primary bg-clip-text text-transparent">Ø</span>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">{activeHotel?.name || "Ouril Hotels"}</p>
                <p className="text-sm font-display font-semibold">In-Suite Hub</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  haptic("tap");
                  setTheme(theme === "dark" ? "light" : "dark");
                }} 
                className="glass rounded-full h-10 w-10 grid place-items-center hover:border-primary/40 transition-colors"
              >
                <Sun className="h-4 w-4 hidden dark:block text-primary" />
                <Moon className="h-4 w-4 dark:hidden block text-primary" />
              </button>
              <Link to="/notifications" aria-label="Notificações" className="glass rounded-full h-10 w-10 grid place-items-center hover:border-primary/40 transition-colors relative">
                <Bell className="h-4 w-4" strokeWidth={1.75} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse border border-background"></span>
              </Link>
            </div>
          </div>

          <FadeUp className="mt-auto" delay={0.05}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isNight ? <Moon className="h-3.5 w-3.5 text-primary" /> : <Sun className="h-3.5 w-3.5 text-primary" />}
              <span>{greeting} · 24°C · {activeHotel?.city || "Mindelo"}</span>
            </div>
            <h1 className="mt-3 font-display text-display-xl font-semibold text-balance">
              {greeting},<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">{displayName}.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Tudo o que a sua estadia no Ouril precisa, ao alcance de um toque. Experiências exclusivas dentro do seu hotel.
            </p>
          </FadeUp>

          <FadeUp className="relative z-10 mt-5 mb-5" delay={0.15}>
            {loading ? <ReservationSkeleton /> : (
              <div className="glass rounded-3xl p-4 shadow-elevated flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A sua suite</p>
                  <p className="mt-1 font-display text-base font-semibold">
                    {currentBooking?.room_name ?? "Suite Atlântica"} · {roomNumber}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {activeHotel?.name} · {activeHotel?.city} · {currentBooking?.check_out_date ? `saída ${new Date(currentBooking.check_out_date).toLocaleDateString('pt-PT', {day: '2-digit', month: 'short'})}` : "4 noites"}
                  </p>
                </div>
                <a href="tel:9" onClick={() => haptic("tap")} aria-label="Chamar Receção"
                  className="h-11 w-11 rounded-full bg-gradient-primary grid place-items-center shadow-glow active:scale-95 transition">
                  <Phone className="h-4 w-4 text-primary-foreground" />
                </a>
              </div>
            )}
          </FadeUp>

          {/* Super App Hotel Selector (Dev/Guest Mode Only) */}
          {sessionStorage.getItem("guest_mode") === "true" && (
            <FadeUp delay={0.2} className="relative z-10 mb-6">
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/60 mb-2.5 ml-1">Navegar como Super App</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {hotels.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      haptic("soft");
                      setActiveHotel(h);
                      toast.success(`Modo: ${h.name}`);
                    }}
                    className={`shrink-0 h-9 px-4 rounded-full border text-[10px] font-bold transition-all ${
                      activeHotel?.id === h.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-glow" 
                        : "bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {h.name.replace("Ouril ", "")}
                  </button>
                ))}
              </div>
            </FadeUp>
          )}
        </div>
      </header>

      <LivingContext />

      {/* TRIDENTE — 3 acções de comando da suite */}
      <section className="px-6 mt-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Comando da Suite</p>
        <div className="grid grid-cols-1 gap-3">
          <HeroAction to="/key" icon={KeyRound} title="Digital Key" subtitle={`Abrir porta · Suite ${roomNumber}`} pulse />
          <div className="grid grid-cols-2 gap-3">
            <HeroAction to="/room" icon={SlidersHorizontal} title="Ar Condicionado" subtitle="Controlo de clima" compact />
            <HeroAction to="/concierge" icon={Sparkles} title="Soul Chat" subtitle="Concierge IA" compact />
          </div>
        </div>
      </section>

      {/* Prato do Dia — Dinâmico do Admin */}
      <section className="px-6 mt-7">
        <div className="glass rounded-3xl overflow-hidden border-primary/20 bg-primary/5">
          <div className="relative h-32 w-full overflow-hidden">
            <img src={pratoDoDia?.image_url || "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop"} alt="Prato do dia" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <span className="text-[9px] uppercase tracking-widest text-primary font-bold bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded-full">Prato do Dia</span>
              <h3 className="font-display text-lg font-semibold mt-1">{pratoDoDia?.name || "Cachupa Rica Ouril"}</h3>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground max-w-[180px]">{pratoDoDia?.description || "O sabor tradicional de Cabo Verde com o toque do nosso Chef."}</p>
            <Link to="/gastronomy" className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center active:scale-95 transition shadow-glow">
              Pedir {pratoDoDia?.price || "€14.50"}
            </Link>
          </div>
        </div>
      </section>

      {/* Express Service — pedidos de 1 toque */}
      <section className="px-6 mt-7">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Express · 1 toque</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { l: "Água", icon: Droplets, p: 3 },
            { l: "Toalhas", icon: Brush, p: 0 },
            { l: "Gelo", icon: Snowflake, p: 2 },
            { l: "Café", icon: Coffee, p: 4 },
          ].map((it) => (
            <button key={it.l} onClick={() => expressOrder(it.l, it.p)}
              className="glass rounded-2xl py-3 grid place-items-center gap-1 hover:border-primary/40 active:scale-95 transition-all">
              <it.icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium">{it.l}</span>
              <span className="text-[9px] text-muted-foreground">{it.p > 0 ? `€${it.p}` : "free"}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Painel ao vivo dos pedidos express + impacto na conta */}
      <LiveOrders />

      {/* Privacy Mode — DND / Make Up */}
      <section className="px-6 mt-6">
        <div className="glass rounded-3xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Privacidade</p>
            <p className="text-sm font-medium mt-0.5">
              {privacy === "dnd" ? "Não incomodar" : privacy === "makeup" ? "Arrumar quarto" : "Suite em modo normal"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => togglePrivacy("dnd")}
              className={`h-11 w-11 rounded-full grid place-items-center transition-all ${privacy === "dnd" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
              <BellOff className="h-4 w-4" />
            </button>
            <button onClick={() => togglePrivacy("makeup")}
              className={`h-11 w-11 rounded-full grid place-items-center transition-all ${privacy === "makeup" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
              <Brush className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Outros serviços internos */}
      <section className="px-6 mt-7">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Mais Serviços</p>
        <motion.div className="grid grid-cols-2 gap-3" initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}>
          <QuickAction to="/guide" icon={MapPin} title="Guia Ouril" subtitle="O que oferecemos" />
          <QuickAction to="/medicentro" icon={Stethoscope} title="Medicentro" subtitle="Saúde na suite" />
          <QuickAction to="/wellness" icon={Dumbbell} title="Wellness" subtitle="Ginásio & piscinas" />
          <QuickAction to="/checkout" icon={ArrowUpRight} title="Minha Conta" subtitle="Extracto e check-out" />
        </motion.div>
      </section>

      {/* Tonight at Ouril */}
      <section className="px-6 mt-10 pb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Esta noite no Ouril</p>
            <h2 className="font-display text-2xl font-semibold mt-1">A não perder</h2>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { t: "Morna ao vivo · Ouril Lounge", s: "Piso térreo · 21:30", tag: "Música" },
            { t: "Menu degustação do Chef", s: "Ouril Restaurant · 20:00", tag: "Gastronomia" },
            { t: "Ritual de relaxamento", s: "Ouril SPA · até às 21h", tag: "Bem-estar" },
          ].map((item, idx) => (
            <motion.div key={item.t} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 }}
              className="glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div>
                <p className="font-medium">{item.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.s}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 rounded-full px-2 py-1">
                {item.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

const HeroAction = ({ to, icon: Icon, title, subtitle, pulse, compact }: any) => (
  <motion.div whileTap={{ scale: 0.97 }}>
    <Link to={to}
      className={`relative block glass rounded-3xl ${compact ? "p-4" : "p-5"} border-primary/30 shadow-glow overflow-hidden group`}>
      {pulse && <span className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />}
      <div className={`${compact ? "h-10 w-10" : "h-12 w-12"} rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow mb-3`}>
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.75} />
      </div>
      <p className={`font-display ${compact ? "text-base" : "text-lg"} font-semibold`}>{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </Link>
  </motion.div>
);

const QuickAction = ({ to, icon: Icon, title, subtitle }: any) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} whileTap={{ scale: 0.97 }}>
    <Link to={to} className="block glass rounded-2xl p-4 group hover:-translate-y-0.5 transition-all duration-300">
      <div className="h-9 w-9 rounded-xl bg-muted text-primary grid place-items-center mb-3">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </Link>
  </motion.div>
);

export default Index;
