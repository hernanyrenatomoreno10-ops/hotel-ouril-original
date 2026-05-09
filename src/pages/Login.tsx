import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import heroImg from "@/assets/ouril-facade.webp";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { KeyRound, DoorOpen } from "lucide-react";

const Login = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Mapeia (Quarto + PIN) → credenciais determinísticas geridas internamente.
  // O hóspede recebe o PIN na receção; a primeira utilização cria a sessão.
  const credentialsFor = (r: string, p: string) => ({
    email: `room-${r.trim()}@ouril.hotel`,
    password: `OurilHotel#${p.trim()}`, // ≥ 6 chars garantido
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
    const { email, password } = credentialsFor(room, pin);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        // Primeira entrada do hóspede neste quarto — cria a sessão
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { room_number: room.trim() } },
        });
        if (signUpErr) throw signUpErr;
      }
      haptic("success");
      toast.success(`Bem-vindo à Suite ${room}.`);
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
        alt="Ouril Mindelo Hotel"
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="relative z-10 w-full px-8 pb-16 pt-10">
        <div className="flex items-center gap-3 mb-10 animate-fade-up">
          <div className="relative h-12 w-12 rounded-full bg-background border border-primary/40 grid place-items-center shadow-glow">
            <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
            <span className="relative font-display text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">Ø</span>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Ouril Hotels</p>
            <p className="text-xl font-display font-semibold">Mindelo · In-Room Hub</p>
          </div>
        </div>

        <h1 className="font-display text-4xl font-semibold mb-2 animate-fade-up [animation-delay:100ms]">
          Acesso <span className="bg-gradient-primary bg-clip-text text-transparent">In-Suite</span>.
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs animate-fade-up [animation-delay:200ms]">
          Insira o número da sua suite e o PIN entregue na receção do Ouril Mindelo para ativar o seu concierge digital.
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
            {loading ? "A validar..." : "Entrar na Suite"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground animate-fade-up [animation-delay:400ms]">
          Esqueceu o PIN? Marque <span className="text-primary">9</span> no telefone do quarto.
        </p>

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            haptic("tap");
            const { email, password } = credentialsFor("000", "0000");
            try {
              const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
              if (signInErr) {
                const { error: signUpErr } = await supabase.auth.signUp({
                  email,
                  password,
                  options: { emailRedirectTo: `${window.location.origin}/`, data: { room_number: "000" } },
                });
                if (signUpErr) throw signUpErr;
              }
              haptic("success");
              toast.success("Modo convidado ativo.");
            } catch {
              toast.error("Não foi possível entrar como convidado.");
            } finally {
              setLoading(false);
            }
          }}
          className="mt-4 w-full rounded-full border border-primary/30 bg-background/40 backdrop-blur-sm py-3 text-xs uppercase tracking-[0.3em] text-primary hover:bg-primary/10 transition disabled:opacity-50 animate-fade-up [animation-delay:500ms]"
        >
          Entrar como convidado
        </button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
          Acesso temporário · apenas durante o desenvolvimento
        </p>
      </div>
    </div>
  );
};

export default Login;
