import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import heroImg from "@/assets/ouril-facade.webp";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { KeyRound, DoorOpen, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HotelOption = {
  id: string;
  name: string;
  city: string;
  color: string;
  flag: string;
};

const HOTELS: HotelOption[] = [
  { id: "hotel-mindelo", name: "Ouril Mindelo",  city: "Mindelo · São Vicente",    color: "#c9a96e", flag: "🏖️" },
  { id: "hotel-julia",   name: "Ouril Julia",    city: "São Vicente",               color: "#6e9ec9", flag: "🌊" },
  { id: "hotel-agueda",  name: "Ouril Agueda",   city: "Santa Maria · Sal",         color: "#9ec96e", flag: "🌴" },
  { id: "hotel-pontao",  name: "Ouril Pontão",   city: "Praia · Santiago",          color: "#c96e9e", flag: "🌺" },
];

const Login = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelOption>(HOTELS[0]);
  const [hotelOpen, setHotelOpen] = useState(false);

  if (user || sessionStorage.getItem("guest_mode") === "true") {
    return <Navigate to="/" replace />;
  }

  const credentialsFor = (r: string, p: string, hotelId: string) => ({
    email: `room-${r.trim()}-${hotelId}@ouril.hotel`,
    password: `OurilHotel#${p.trim()}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{2,4}$/.test(room.trim())) {
      toast.error("Número de quarto inválido.");
      return;
    }
    if (!/^\d{4,8}$/.test(pin.trim())) {
      toast.error("PIN deve ter 4 a 8 dígitos.");
      return;
    }
    setLoading(true);
    haptic("tap");
    const { email, password } = credentialsFor(room, pin, selectedHotel.id);
    const metadata = {
      room_number: room.trim(),
      hotel_id: selectedHotel.id,
      hotel_name: selectedHotel.name,
      hotel_city: selectedHotel.city,
    };
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        // First login — create account
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: metadata,
          },
        });
        if (signUpErr) throw signUpErr;
      } else {
        // Update hotel metadata on each login (in case guest moves between hotels)
        await supabase.auth.updateUser({ data: metadata });
      }
      haptic("success");
      toast.success(`Bem-vindo à Suite ${room} · ${selectedHotel.name}.`);
    } catch (err: any) {
      toast.error("PIN incorreto. Contacte a receção.");
      haptic("soft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col justify-end">
      <img
        src={heroImg}
        alt="Ouril Hotel"
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="relative z-10 w-full px-8 pb-16 pt-10">
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <div className="relative h-12 w-12 rounded-full bg-background border grid place-items-center shadow-glow"
               style={{ borderColor: selectedHotel.color + "66" }}>
            <span className="absolute inset-0 rounded-full animate-pulse-glow" 
                  style={{ background: selectedHotel.color + "20" }} />
            <span className="relative font-display text-lg font-bold"
                  style={{ color: selectedHotel.color }}>Ø</span>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: selectedHotel.color }}>Ouril Hotels & Resorts</p>
            <p className="text-xl font-display font-semibold">In-Room Digital Hub</p>
          </div>
        </div>

        {/* Hotel Selector */}
        <div className="relative mb-6 animate-fade-up [animation-delay:50ms]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 ml-2">A minha propriedade</p>
          <button
            type="button"
            onClick={() => { setHotelOpen(v => !v); haptic("tap"); }}
            className="w-full flex items-center justify-between bg-muted/40 border border-border/40 rounded-2xl px-5 py-4 text-left backdrop-blur-sm transition hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedHotel.flag}</span>
              <div>
                <p className="font-display font-semibold text-sm" style={{ color: selectedHotel.color }}>{selectedHotel.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedHotel.city}</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", hotelOpen && "rotate-180")} />
          </button>

          {/* Dropdown */}
          {hotelOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 glass rounded-2xl overflow-hidden shadow-2xl border border-border/40 animate-in slide-in-from-top-2 duration-200">
              {HOTELS.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => { setSelectedHotel(h); setHotelOpen(false); haptic("tap"); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 text-left transition hover:bg-muted/40",
                    selectedHotel.id === h.id && "bg-muted/30"
                  )}
                >
                  <span className="text-xl">{h.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: h.color }}>{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.city}</p>
                  </div>
                  {selectedHotel.id === h.id && (
                    <div className="h-2 w-2 rounded-full" style={{ background: h.color }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="font-display text-4xl font-semibold mb-2 animate-fade-up [animation-delay:100ms]">
          Acesso <span className="bg-gradient-primary bg-clip-text text-transparent">In-Suite</span>.
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs animate-fade-up [animation-delay:200ms]">
          Insira o número da suite e o PIN entregue na receção para ativar o seu concierge digital.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up [animation-delay:300ms]">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2">Número do Quarto</label>
            <div className="relative">
              <DoorOpen className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={room}
                onChange={(e) => setRoom(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="412"
                required
                className="w-full bg-muted/40 border border-border/40 rounded-full pl-12 pr-5 py-4 text-sm tracking-[0.3em] font-display outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2">PIN de Acesso</label>
            <div className="relative">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="••••"
                required
                minLength={4}
                className="w-full bg-muted/40 border border-border/40 rounded-full pl-12 pr-5 py-4 text-sm tracking-[0.5em] outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-full bg-gradient-primary text-primary-foreground py-4 text-sm font-medium shadow-glow active:scale-[0.98] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? "A validar..." : (
              <>Entrar na Suite <ChevronRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground animate-fade-up [animation-delay:400ms]">
          Esqueceu o PIN? Marque <span className="text-primary">9</span> no telefone do quarto.
        </p>

        <button
          type="button"
          onClick={() => {
            haptic("success");
            sessionStorage.setItem("guest_mode", "true");
            sessionStorage.setItem("dev_hotel_id", HOTELS[0].id);
            window.location.href = "/";
          }}
          className="mt-4 w-full rounded-full border border-primary/30 bg-background/40 backdrop-blur-sm py-3 text-xs uppercase tracking-[0.3em] text-primary hover:bg-primary/10 transition animate-fade-up [animation-delay:500ms]"
        >
          Acesso Rápido (Convidado)
        </button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
          Acesso temporário · apenas durante o desenvolvimento
        </p>

        <Link to="/staff/admin"
          className="mt-6 block text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition">
          Acesso Staff · Back-office
        </Link>
      </div>
    </div>
  );
};

export default Login;
