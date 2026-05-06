import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Msg = { from: "user" | "ai"; text: string; actionType?: "gastronomy" | "experience"; actionData?: any };

const suggestions = [
  "Pedir menu do Ouril Bar",
  "Agendar massagem no Ouril SPA",
  "Reservar mesa no Ouril Restaurant",
  "Pedir toalhas extras à suite",
  "Acesso à piscina interior",
  "Onde ouvir Morna hoje?",
];

const Concierge = () => {
  const { user } = useAuth();
  const userName = user?.email ? user.email.split('@')[0] : "Hóspede";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
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
      const history = newMessages.map(m => ({
        role: m.from === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const { data, error } = await supabase.functions.invoke("soul-chat", {
        body: { messages: history, userName: displayName },
      });
      if (error) throw error;

      if (data?.type === "tool") {
        const { name, args } = data;
        if (name === "request_hotel_service") {
          const { service_type, description } = args;
          if (user?.id) {
            await supabase.from("service_requests").insert({
              user_id: user.id, service_type, description,
            });
          }
          import("sonner").then(({ toast }) => toast.success(`Pedido registado: ${service_type}`));
          import("@/lib/haptics").then(({ haptic }) => haptic("success"));
          window.dispatchEvent(new CustomEvent("mh:account-update"));
          setMessages((m) => [...m, { from: "ai", text: `Com certeza. Já registei o seu pedido para "${description}". A nossa equipa entregará na sua suite em breve.` }]);
        } else if (name === "suggest_gastronomy") {
          setMessages((m) => [...m, { from: "ai", text: "Aqui está a minha sugestão do Ouril Restaurant:", actionType: "gastronomy", actionData: args }]);
        } else if (name === "suggest_experience") {
          setMessages((m) => [...m, { from: "ai", text: "Recomendo vivamente esta experiência:", actionType: "experience", actionData: args }]);
        }
      } else {
        setMessages((m) => [...m, { from: "ai", text: data?.text ?? "" }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((m) => [...m, { from: "ai", text: "O Monte Cara está nublado por agora — a equipa técnica já foi notificada. Tentemos novamente?" }]);
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
              {m.actionType === "experience" && m.actionData && (
                <div className="mr-auto w-[85%] glass rounded-3xl p-4 animate-fade-up delay-300 border-primary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Reserva Sugerida</p>
                      <p className="font-display text-base font-semibold mt-1">{m.actionData.title}</p>
                      <p className="text-xs text-muted-foreground">{m.actionData.place}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      import("@/lib/haptics").then(({ haptic }) => haptic("success"));
                      if (user?.id) {
                        await supabase.from("experience_reservations").insert({
                          user_id: user.id,
                          title: m.actionData.title,
                          place: m.actionData.place,
                          status: "confirmed",
                        });
                      }
                      import("sonner").then(({ toast }) => toast.success(`Reserva confirmada: ${m.actionData.title}`));
                      window.dispatchEvent(new CustomEvent("mh:account-update"));
                      setMessages(msgs => [...msgs, { from: "ai", text: "Excelente! A sua reserva foi confirmada." }]);
                    }}
                    className="mt-4 w-full bg-gradient-primary text-primary-foreground py-2 rounded-full text-xs font-bold shadow-glow"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              )}

              {m.actionType === "gastronomy" && m.actionData && (
                <div className="mr-auto w-[85%] glass rounded-3xl p-4 animate-fade-up delay-300 border-primary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Sugestão do Chef</p>
                      <p className="font-display text-base font-semibold mt-1">{m.actionData.item_name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{m.actionData.description}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-display text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                      €{m.actionData.price.toFixed(2)}
                    </p>
                    <button 
                      onClick={async () => {
                        import("@/lib/haptics").then(({ haptic }) => haptic("success"));
                        if (user?.id) {
                          await supabase.from("gastronomy_orders").insert({
                            user_id: user.id,
                            item_name: m.actionData.item_name,
                            price: m.actionData.price,
                            status: "pending",
                          });
                        }
                        import("sonner").then(({ toast }) => toast.success(`Pedido enviado: ${m.actionData.item_name}`));
                        window.dispatchEvent(new CustomEvent("mh:account-update"));
                        setMessages(msgs => [...msgs, { from: "ai", text: "O seu pedido foi enviado para a cozinha. O Room Service entregará em breve." }]);
                      }}
                      className="px-4 py-2 bg-foreground text-background rounded-full text-xs font-bold shadow-glow"
                    >
                      Pedir Agora
                    </button>
                  </div>
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