import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import heroImg from "@/assets/ouril-facade.webp";
import { Waves } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Login = () => {
  const { user, mockLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Representará a Referência da Reserva
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, manda para a home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGuestLogin = () => {
    haptic("success");
    mockLogin();
    toast.success("Modo Convidado ativo para testes");
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    haptic("tap");
    
    // Tentamos fazer login. Se o usuário não existir (no contexto de protótipo de hotel), 
    // podemos usar a função signUp auto-gerada para facilitar os testes, ou apenas signIn.
    // Para um app real, o PMS do hotel já teria criado o usuário via API Admin.
    // Aqui usaremos signUp como fallback para que o usuário consiga testar imediatamente.
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Fallback: se não encontrar (invalid credentials), tenta registrar (Mock do PMS do hotel)
        if (signInError.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (signUpError) throw signUpError;
          
          // Se registrou e logou
          haptic("success");
          toast.success("Bem-vindo ao Mindelo Luxury Hub.");
        } else {
          throw signInError;
        }
      } else {
        haptic("success");
        toast.success("Bem-vindo de volta.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro de autenticação.");
      haptic("soft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col justify-end">
      {/* Imagem de Fundo Completa */}
      <img
        src={heroImg}
        alt="Mindelo Bay"
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      {/* Gradiente Escuro cobrindo 70% da tela a partir de baixo */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <div className="relative z-10 w-full px-8 pb-16 pt-10">
        <div className="flex items-center gap-3 mb-10 animate-fade-up">
          <div className="relative h-12 w-12 rounded-full bg-background border border-primary/40 grid place-items-center shadow-glow">
            <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
            <span className="relative font-display text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">Ø</span>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Ouril Hotels</p>
            <p className="text-xl font-display font-semibold">Mindelo · Luxury Hub</p>
          </div>
        </div>

        <h1 className="font-display text-4xl font-semibold mb-2 animate-fade-up [animation-delay:100ms]">
          A sua <span className="bg-gradient-primary bg-clip-text text-transparent">Chave Digital</span>.
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs animate-fade-up [animation-delay:200ms]">
          Insira o e-mail da reserva e a referência fornecida pela receção para aceder ao seu assistente de estadia.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 animate-fade-up [animation-delay:300ms]">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alessandro@exemplo.com"
              required
              className="w-full bg-muted/40 border border-border/40 rounded-full px-5 py-4 text-sm outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-2">Ref. Reserva (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ex: MIN-412"
              required
              className="w-full bg-muted/40 border border-border/40 rounded-full px-5 py-4 text-sm outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-full bg-gradient-primary text-primary-foreground py-4 text-sm font-medium shadow-glow active:scale-[0.98] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? "Autenticando..." : "Desbloquear Estadia"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center animate-fade-up [animation-delay:400ms]">
          <div className="w-full flex items-center gap-4 mb-4 opacity-50">
            <div className="h-px flex-1 bg-border"></div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <button
            onClick={handleGuestLogin}
            type="button"
            className="w-full rounded-full glass border border-primary/30 py-4 text-sm font-medium text-foreground hover:bg-primary/10 active:scale-[0.98] transition"
          >
            Aceder como Convidado
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
