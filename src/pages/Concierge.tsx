import { useState } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type Msg = { from: "user" | "ai"; text: string };

const suggestions = [
  "Onde ouvir Morna hoje?",
  "Pedir toalhas extras",
  "Reservar mesa para 2",
  "Dicas culturais em Mindelo",
];

const Concierge = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ai", text: "Boa noite Alessandro. Sou o Soul, o seu concierge em Mindelo. Como posso tornar a sua estadia inesquecível?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: "ai",
          text: "Claro. Esta noite o Café Musique recebe Tito Paris às 21:30. Posso reservar uma mesa privada na varanda com vista para a baía?",
        },
      ]);
    }, 700);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen pb-32">
        <header className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] flex items-center justify-between">
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

        <div className="flex-1 overflow-y-auto px-6 mt-6 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-fade-up ${
                m.from === "ai"
                  ? "glass mr-auto rounded-bl-md"
                  : "ml-auto bg-gradient-primary text-primary-foreground rounded-br-md shadow-glow"
              }`}
            >
              {m.text}
            </div>
          ))}
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