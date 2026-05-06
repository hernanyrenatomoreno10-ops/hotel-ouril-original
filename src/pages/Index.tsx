import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, KeyRound, Sparkles, Wine, Waves, Sun, Moon, MapPin, ArrowUpRight, SlidersHorizontal, Stethoscope, type LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import LivingContext from "@/components/LivingContext";
import heroImg from "@/assets/ouril-facade.webp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useDayPhase, phaseClass, phaseGreeting } from "@/lib/context";
import { FadeUp } from "@/components/Motion";
import { ReservationSkeleton, ListItemSkeleton } from "@/components/Skeleton";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  const phase = useDayPhase();
  const greeting = phaseGreeting(phase);
  const isNight = phase === "night" || phase === "evening";
  const userEvent = "O seu veleiro parte às 09:00"; // Mock context
  
  const userName = user?.email ? user.email.split('@')[0] : "Alessandro";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const [bookedExperiences, setBookedExperiences] = useState<any[]>([]);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStayData();
  }, []);

  const fetchStayData = async () => {
    try {
      const [expsRes, bookRes] = await Promise.all([
        supabase.from('experience_reservations').select('*').eq('status', 'confirmed'),
        supabase.from('bookings').select('*, hotels(name)').limit(1).maybeSingle(),
      ]);
      if (expsRes.data) setBookedExperiences(expsRes.data);
      if (bookRes.data) {
        const b: any = bookRes.data;
        setCurrentBooking({ ...b, hotel_name: b.hotels?.name });
      }
    } catch (err) {
      console.warn("Stay sem dados:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className={`${phaseClass(phase)} pointer-events-none fixed inset-x-0 top-0 h-[60vh] ctx-tint -z-0`} />
      {/* Hero */}
      <header className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Vista aérea da baía do Porto Grande e Monte Cara em Mindelo, Cabo Verde ao anoitecer"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-hero" />

        <div className="relative z-10 flex h-full flex-col px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
                <Waves className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mindelo</p>
                <p className="text-sm font-display font-semibold">Hub</p>
              </div>
            </div>
            <Link
              to="/notifications"
              aria-label="Notificações"
              className="glass rounded-full h-10 w-10 grid place-items-center hover:border-primary/40 transition-colors relative"
            >
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              {/* Ponto vermelho para novas notificações (mock) */}
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse border border-background"></span>
            </Link>
          </div>

          {/* Greeting */}
          <FadeUp className="mt-auto" delay={0.05}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isNight ? <Moon className="h-3.5 w-3.5 text-primary" /> : <Sun className="h-3.5 w-3.5 text-primary" />}
              <span>{greeting}, São Vicente · 24°C</span>
            </div>
            <h1 className="mt-3 font-display text-display-xl font-semibold text-balance">
              {greeting},<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">{displayName}.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {phase === "night"
                ? "O oceano está calmo esta noite — perfeito para uma Morna ao luar."
                : phase === "evening"
                ? "O pôr-do-sol pinta o Monte Cara. Tempo de jantar à beira-mar."
                : phase === "morning"
                ? `Café da manhã servido até às 11h. ${userEvent}.`
                : `O sol brilha sobre o Porto Grande. ${userEvent}.`}
            </p>
          </FadeUp>

          {/* Reservation card */}
          <FadeUp className="relative z-10 mt-6 mb-6" delay={0.15}>
            {loading ? <ReservationSkeleton /> : (
            <div className="glass rounded-3xl p-5 shadow-elevated">
              <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reserva atual</p>
                <p className="mt-1 font-display text-lg font-semibold">
                  {currentBooking ? `${currentBooking.room_name || 'Suite'} · ${currentBooking.room_number}` : 'Suite Atlântica · 412'}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {currentBooking?.hotel_name || 'Pestana Trópico, Mindelo'}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 text-primary text-[10px] font-medium px-2.5 py-1 border border-primary/20">
                Check-in
              </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { l: "Chegada", v: currentBooking ? new Date(currentBooking.check_in_date).toLocaleDateString('pt-PT', {day: '2-digit', month: 'short'}) : "Hoje" },
                { l: "Saída", v: currentBooking ? new Date(currentBooking.check_out_date).toLocaleDateString('pt-PT', {day: '2-digit', month: 'short'}) : "07 Mai" },
                { l: "Noites", v: currentBooking ? "4" : "4" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-muted/40 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                  <p className="text-sm font-semibold mt-0.5">{s.v}</p>
                </div>
              ))}
              </div>
            </div>
            )}
          </FadeUp>
        </div>
      </header>

      {/* Living context — real-time ambient strip */}
      <LivingContext />

      {/* Quick actions */}
      <section className="px-6 mt-6">
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        >
          <QuickAction
            to="/key"
            icon={KeyRound}
            title="Digital Key"
            subtitle="Suite 412 · Aproxime"
            featured={!isNight}
          />
          <QuickAction
            to="/room"
            icon={SlidersHorizontal}
            title="Room Control"
            subtitle="Cenas · clima · cortinas"
            featured={isNight}
          />
          <QuickAction
            to="/gastronomy"
            icon={Wine}
            title="Gastronomia"
            subtitle={isNight ? "Menu de jantar aberto" : "Sabor do Porto Grande"}
          />
          <QuickAction
            to="/concierge"
            icon={Sparkles}
            title="Soul Chat"
            subtitle="IA Concierge"
          />
          <QuickAction
            to="/medicentro"
            icon={Stethoscope}
            title="Medicentro"
            subtitle="Saúde & Bem-estar"
          />
          <QuickAction
            to="/experiences"
            icon={MapPin}
            title="Explorar"
            subtitle={phase === "morning" ? "Tours desta manhã" : "Atividades em Mindelo"}
          />
        </motion.div>
      </section>

      {/* White Glove Services & Music */}
      <section className="px-6 mt-10">
        <div className="grid grid-cols-1 gap-4">
          {/* Mindelo Vibe Player */}
          <div className="glass rounded-3xl p-5 border-primary/20 shadow-glow overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden border border-primary/30 relative">
                <img 
                  src="https://images.unsplash.com/photo-1514525253344-f8565359c997?q=80&w=200&auto=format&fit=crop" 
                  alt="Mindelo Music"
                  className="h-full w-full object-cover animate-pulse-slow"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Waves className="h-5 w-5 text-primary-foreground animate-bounce" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Mindelo Vibe</p>
                <h3 className="font-display text-base font-semibold truncate mt-0.5">Petit Pays · Cesária Évora</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Som ambiente · Suite 412</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="h-10 w-10 glass rounded-full grid place-items-center hover:bg-primary/20 transition-colors">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Valet & Laundry Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-3xl p-4 border-border/40">
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-xl bg-muted grid place-items-center">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[9px] uppercase font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Pronto</span>
              </div>
              <p className="text-xs font-semibold">Valet Parking</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Audi Q8 · Portaria</p>
              <button className="mt-3 w-full py-1.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all">Trazer Carro</button>
            </div>
            <div className="glass rounded-3xl p-4 border-border/40">
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-xl bg-muted grid place-items-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Em curso</span>
              </div>
              <p className="text-xs font-semibold">Laundry</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">3 Itens · Entrega 18h</p>
              <button className="mt-3 w-full py-1.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all">Ver Detalhes</button>
            </div>
          </div>
        </div>
      </section>

      {/* Tonight in Mindelo & Bookings */}
      <section className="px-6 mt-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A sua agenda</p>
            <h2 className="font-display text-2xl font-semibold mt-1">Atividades e Eventos</h2>
          </div>
          <Link to="/experiences" className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
            Explorar <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {loading && (
            <>
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </>
          )}
          {!loading && bookedExperiences.map((item, idx) => (
             <div
             key={`booked-${idx}`}
             className="glass rounded-2xl p-4 flex items-center justify-between border-primary/40 shadow-glow"
           >
             <div>
               <p className="font-medium">{item.title}</p>
               <p className="text-xs text-muted-foreground mt-0.5">{item.place}</p>
             </div>
             <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/20 rounded-full px-2 py-1 bg-primary/10">
               Confirmado
             </span>
           </div>
          ))}
          {!loading && [
            { t: "Morna ao vivo", s: "Café Musique · 21:30", tag: "Cultura" },
            { t: "Jantar no Porto Grande", s: "Marina · 20:00", tag: "Gastronomia" },
            { t: "Pôr-do-sol no Monte Cara", s: "Mirante · 18:42", tag: "Natureza" },
          ].map((item, idx) => (
            <motion.div
              key={item.t}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 }}
              className="glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="font-medium">{item.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.s}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-1">
                {item.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guia Local (Hidden Gems) */}
      <section className="px-6 mt-10 pb-6">
        <Link to="/guide" className="group relative h-32 w-full rounded-3xl overflow-hidden glass shadow-elevated block">
          <img 
            src="https://images.unsplash.com/photo-1694263595508-3f5ef5808779?q=80&w=600&auto=format&fit=crop" 
            alt="Mindelo Guide"
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Explore+</p>
            <h2 className="font-display text-xl font-semibold mt-1">Guia Local Mindelo</h2>
            <p className="text-xs text-muted-foreground mt-1">Pérolas escondidas curadas pelo seu concierge.</p>
          </div>
        </Link>
      </section>

    </AppShell>
  );
};

const QuickAction = ({
  to,
  icon: Icon,
  title,
  subtitle,
  featured,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  featured?: boolean;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 14 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    }}
    whileTap={{ scale: 0.97 }}
  >
    <Link
      to={to}
      className={`block glass rounded-2xl p-4 group hover:-translate-y-0.5 transition-all duration-300 ${
        featured ? "border-primary/40 shadow-glow" : ""
      }`}
    >
      <div
        className={`h-9 w-9 rounded-xl grid place-items-center mb-3 ${
          featured ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-primary"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </Link>
  </motion.div>
);

export default Index;
