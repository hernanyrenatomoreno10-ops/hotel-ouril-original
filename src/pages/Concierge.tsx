import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Msg = { from: "user" | "ai"; text: string };

const suggestions = [
  "Onde ouvir Morna hoje?",
  "Pedir toalhas extras",
  "Reservar mesa para 2",
  "Dicas culturais em Mindelo",
];

const Concierge = () => {
  const { user } = useAuth();
  const userName = user?.email ? user.email.split('@')[0] : "Hóspede";
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ai", text: `Boa noite, ${userName}. Sou o Soul, o seu olhar atento em Mindelo. Como posso elevar a sua estadia hoje?` },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages: Msg[] = [...messages, { from: "user", text }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Chave VITE_GEMINI_API_KEY não configurada.");
      }

      const history = newMessages.map(m => ({
        role: m.from === "ai" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const systemInstruction = {
        role: "user",
        parts: [{ text: `Você é o 'Soul', o concierge virtual de luxo do Mindelo Luxury Hub em São Vicente, Cabo Verde. O hóspede se chama ${userName}. Se o hóspede pedir algum serviço (como toalhas, comida, limpeza), use a ferramenta request_hotel_service para registrar o pedido. Fale português de Portugal de forma elegante.` }]
      };

      const tools = [{
        functionDeclarations: [{
          name: "request_hotel_service",
          description: "Cria um pedido de serviço físico para o hotel (toalhas, comida, limpeza, manutenção). Use sempre que o hóspede solicitar algo concreto.",
          parameters: {
            type: "OBJECT",
            properties: {
              service_type: { type: "STRING", description: "Categoria do serviço (ex: 'Housekeeping', 'Room Service')" },
              description: { type: "STRING", description: "Descrição exata do pedido (ex: '2 toalhas extras')" }
            },
            required: ["service_type", "description"]
          }
        }]
      }];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [systemInstruction, ...history],
          tools,
          generationConfig: { temperature: 0.5, maxOutputTokens: 200 }
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      const part = data.candidates[0].content.parts[0];
      
      if (part.functionCall && part.functionCall.name === "request_hotel_service") {
        const { service_type, description } = part.functionCall.args;
        
        // Registrar no Supabase
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';
        const { error } = await supabase.from('service_requests').insert([{
          user_id: userId,
          service_type,
          description
        }]);
        
        if (error) console.error("Erro no Supabase:", error);
        
        // Feedback Visual
        import("sonner").then(({ toast }) => toast.success(`Pedido registado: ${service_type}`));
        import("@/lib/haptics").then(({ haptic }) => haptic("success"));
        
        setMessages((m) => [...m, { from: "ai", text: `Com certeza. Já registei o seu pedido para "${description}". A nossa equipa entregará na sua suite em breve.` }]);
      } else {
        const aiText = part.text;
        setMessages((m) => [...m, { from: "ai", text: aiText }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((m) => [...m, { from: "ai", text: `[Modo Offline] ${err.message.includes('API_KEY') ? 'A API do Gemini não está configurada no .env' : 'Erro de conexão'}. Se eu estivesse online, faria isso de imediato.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen pb-32">
        <header className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-display font-semibold">Soul</p>
              <p className="text-[10px] text-muted-foreground">Concierge IA · Online</p>
            </div>
          </div>
          <div className="h-10 w-10" />
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 mt-6 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-fade-up ${
                  m.from === "ai"
                    ? "glass mr-auto rounded-bl-md"
                    : "ml-auto bg-gradient-primary text-primary-foreground rounded-br-md shadow-glow"
                }`}
              >
                {m.text}
              </div>
              {m.from === "ai" && m.text.includes("Tito Paris") && (
                <div className="mr-auto w-[85%] glass rounded-3xl p-4 animate-fade-up delay-300 border-primary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Reserva Sugerida</p>
                      <p className="font-display text-base font-semibold mt-1">Café Musique</p>
                      <p className="text-xs text-muted-foreground">Mesa Varanda · 21:30</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gradient-primary text-primary-foreground py-2 rounded-full text-xs font-bold shadow-glow">
                    Confirmar Mesa
                  </button>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 glass animate-fade-up flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">O Soul está a processar...</span>
            </div>
          )}
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 glass rounded-full px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="glass rounded-full p-1.5 pl-5 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao Soul..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Enviar"
              className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow active:scale-95 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default Concierge;