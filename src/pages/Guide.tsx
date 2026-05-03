import AppShell from "@/components/AppShell";
import { ArrowLeft, Map as MapIcon, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const GEMS = [
  {
    title: "Monte Cara",
    category: "Natureza",
    desc: "O cartão postal de Mindelo. O perfil da montanha se assemelha a um rosto humano olhando para o céu.",
    img: "https://images.unsplash.com/photo-1694263595508-3f5ef5808779?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Mercado Municipal",
    category: "Cultura",
    desc: "Cores vibrantes, aromas intensos e a verdadeira alma cabo-verdiana no centro da cidade.",
    img: "https://images.unsplash.com/photo-1628131379740-1ecb4c7c8803?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Praia da Laginha",
    category: "Praia",
    desc: "Areia branca e água cristalina, ideal para o sunset com música ao vivo nos bares locais.",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
  },
];

const Guide = () => {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex bg-muted/40 p-1 rounded-full border border-border/40">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${view === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Lista
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${view === "map" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Mapa
            </button>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Mindelo<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Hidden Gems</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Descubra a alma da ilha através dos olhos do nosso concierge.
          </p>
        </div>

        {view === "list" ? (
          <div className="space-y-6 pb-12">
            {GEMS.map((gem, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative h-48 w-full rounded-3xl overflow-hidden glass shadow-elevated">
                  <img src={gem.img} alt={gem.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] uppercase tracking-wider text-primary bg-background/50 backdrop-blur px-2 py-0.5 rounded-full border border-primary/20">
                      {gem.category}
                    </span>
                    <h2 className="font-display text-xl font-semibold mt-2">{gem.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 pl-2 border-l-2 border-primary/30">
                  {gem.desc}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-[60vh] rounded-3xl overflow-hidden glass border-border/40 flex items-center justify-center bg-muted/20">
            {/* Mock Map View */}
            <MapIcon className="h-16 w-16 text-muted-foreground/30 absolute" />
            <div className="absolute top-1/4 left-1/4">
              <div className="h-4 w-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
              <p className="text-xs font-medium absolute top-5 -left-4">Laginha</p>
            </div>
            <div className="absolute top-1/2 right-1/4">
              <div className="h-4 w-4 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
              <p className="text-xs font-medium absolute top-5 -left-4">Mercado</p>
            </div>
            <div className="absolute bottom-1/4 left-1/3">
              <Navigation className="h-6 w-6 text-blue-400 rotate-45 drop-shadow-md" />
              <p className="text-xs text-blue-400 font-bold absolute top-6 -left-2">Você</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Guide;
