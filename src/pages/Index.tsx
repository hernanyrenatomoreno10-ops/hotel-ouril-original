import { Link } from "react-router-dom";
import { Bell, KeyRound, Sparkles, Wine, Waves, Sun, MapPin, ArrowUpRight, type LucideIcon } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/mindelo-hero.jpg";

const Index = () => {
  return (
    <AppShell>
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
            <button
              aria-label="Notificações"
              className="glass rounded-full h-10 w-10 grid place-items-center hover:border-primary/40 transition-colors"
            >
              <Bell className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Greeting */}
          <div className="mt-auto animate-fade-up">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="h-3.5 w-3.5 text-primary" />
              <span>Boa noite, São Vicente · 24°C</span>
            </div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] text-balance">
              Bem-vindo de volta,<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Alessandro.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A sua estadia em Mindelo continua. O oceano está calmo esta noite — perfeito para uma Morna ao luar.
            </p>
          </div>

          {/* Reservation card */}
          <div className="relative z-10 mt-6 mb-6 glass rounded-3xl p-5 shadow-elevated">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reserva atual</p>
                <p className="mt-1 font-display text-lg font-semibold">Suite Atlântica · 412</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> Pestana Trópico, Mindelo
                </p>
              </div>
              <span className="rounded-full bg-primary/10 text-primary text-[10px] font-medium px-2.5 py-1 border border-primary/20">
                Check-in
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { l: "Chegada", v: "Hoje" },
                { l: "Saída", v: "07 Mai" },
                { l: "Noites", v: "4" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-muted/40 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                  <p className="text-sm font-semibold mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <section className="px-6 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            to="/key"
            icon={KeyRound}
            title="Digital Key"
            subtitle="Suite 412 · Aproxime"
            featured
          />
          <QuickAction
            to="/concierge"
            icon={Sparkles}
            title="Soul Chat"
            subtitle="IA Concierge"
          />
          <QuickAction
            to="/experiences"
            icon={Wine}
            title="Experiências"
            subtitle="Mindelo & Sto. Antão"
          />
          <QuickAction
            to="/checkout"
            icon={ArrowUpRight}
            title="Smart Check-out"
            subtitle="Fatura instantânea"
          />
        </div>
      </section>

      {/* Tonight in Mindelo */}
      <section className="px-6 mt-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Esta noite</p>
            <h2 className="font-display text-2xl font-semibold mt-1">Mindelo desperta</h2>
          </div>
          <Link to="/experiences" className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
            Ver tudo <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {[
            { t: "Morna ao vivo", s: "Café Musique · 21:30", tag: "Cultura" },
            { t: "Jantar no Porto Grande", s: "Marina · 20:00", tag: "Gastronomia" },
            { t: "Pôr-do-sol no Monte Cara", s: "Mirante · 18:42", tag: "Natureza" },
          ].map((item) => (
            <div
              key={item.t}
              className="glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="font-medium">{item.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.s}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/20 rounded-full px-2 py-1">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Digital Key FAB */}
      <Link
        to="/key"
        aria-label="Abrir Digital Key"
        className="fixed bottom-28 right-5 z-30 group"
      >
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-glow" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-active:scale-95">
          <KeyRound className="h-6 w-6" strokeWidth={2} />
        </span>
      </Link>
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
  <Link
    to={to}
    className={`glass rounded-2xl p-4 group hover:-translate-y-0.5 transition-all duration-300 ${
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
);

export default Index;
