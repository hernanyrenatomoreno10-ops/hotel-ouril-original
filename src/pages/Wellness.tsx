import AppShell from "@/components/AppShell";
import { ArrowLeft, Dumbbell, Waves, Flower2, Timer, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { useState } from "react";

const Wellness = () => {
  const [booking, setBooking] = useState<string | null>(null);

  const handleBook = (service: string) => {
    haptic("success");
    setBooking(service);
    toast.success(`${service} solicitado`, {
      description: "O concierge entrará em contacto para confirmar o horário."
    });
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Bem-estar</p>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Wellness & Fitness</p>
          <h1 className="font-display text-3xl font-semibold mt-1">Recarregue as<br/>energias no Ouril.</h1>
          <p className="text-sm text-muted-foreground mt-2">Piscina infinita, ginásio 24/7 e rituais de spa exclusivos.</p>
        </div>

        {/* Ginásio */}
        <section className="mt-8 relative overflow-hidden rounded-3xl glass group">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1024" 
            className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Gym"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <h2 className="font-display text-xl font-semibold">Ouril Fitness</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-primary/20 text-primary rounded-full">Aberto 24/7</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Equipamentos Technogym de última geração. Localizado no Piso 0.</p>
            <button 
              onClick={() => handleBook("Personal Trainer")}
              className="mt-4 w-full py-2 rounded-full glass border-primary/20 text-xs font-medium hover:bg-primary/10 transition"
            >
              Agendar Personal Trainer
            </button>
          </div>
        </section>

        {/* Piscinas */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center mb-3">
              <Waves className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Infinity Pool</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Rooftop · 08:00 - 20:00</p>
          </div>
          <div className="glass rounded-3xl p-5 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center mb-3">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Piscina Pátio</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Piso 0 · Água Aquecida</p>
          </div>
        </section>

        {/* Rituais Spa */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Rituais de Assinatura</h2>
            <Link to="/experiences" className="text-[10px] font-bold text-primary uppercase tracking-wider">Ver Todos</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Massagem de Sal do Sal", time: "60 min", price: "€65" },
              { name: "Facial Oxigénio Mindelo", time: "45 min", price: "€50" },
            ].map((s) => (
              <div key={s.name} className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.time} · {s.price}</p>
                </div>
                <button 
                  onClick={() => handleBook(s.name)}
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center hover:bg-primary text-primary-foreground transition"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
};

export default Wellness;
