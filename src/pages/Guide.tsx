import AppShell from "@/components/AppShell";
import { ArrowLeft, Building2, Coffee, Waves, Dumbbell, MapPin, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const FACILITIES = [
  {
    title: "Restaurante Américos",
    category: "Gastronomia",
    floor: "Piso 6",
    desc: "Pequeno-almoço buffet (07:00 - 11:00). Almoços casuais e jantares formais com cozinha moderna e inspiração cabo-verdiana.",
    icon: Coffee,
    img: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Infinity Pool & Rooftop Bar",
    category: "Lazer",
    floor: "Piso Superior",
    desc: "Piscina com borda infinita aquecida e vista panorâmica sobre a Baía do Mindelo. Serviço de snack-bar focado em bebidas refrescantes.",
    icon: Waves,
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Piscina Interior & SPA",
    category: "Bem-estar",
    floor: "Piso 6",
    desc: "Acesso gratuito à piscina interior aquecida e Jacuzzi. Salas de massagens e tratamentos inspirados na alma de Cabo Verde (sob marcação).",
    icon: Waves,
    img: "https://images.unsplash.com/photo-1544161515-4af6b1d462c2?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Piscina do Pátio Central",
    category: "Lazer",
    floor: "Piso 0",
    desc: "Piscina exterior resguardada dos ventos alísios, ideal para famílias. Conta com um bar de apoio próprio.",
    icon: Waves,
    img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Fitness Suite",
    category: "Bem-estar",
    floor: "Piso 6",
    desc: "Ginásio compacto e bem equipado para treino cardiovascular e de força, com vista panorâmica. Acesso exclusivo para hóspedes.",
    icon: Dumbbell,
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Receção & Concierge 24h",
    category: "Serviços",
    floor: "Piso 0",
    desc: "Atendimento ininterrupto. Serviços disponíveis: Câmbio, ATM, Guarda-volumes, Lavandaria e agendamento de Transfers (aprox. 1500 CVE).",
    icon: Info,
    img: "https://images.unsplash.com/photo-1562790351-d273a961e0e9?q=80&w=600&auto=format&fit=crop",
  }
];

const ROOM_TYPES = [
  { name: "Standard Double", size: "25-26 m²", view: "Piscina ou Montanha", amenities: "Varanda, Smart TV, Frigobar" },
  { name: "Superior Double", size: "25-26 m²", view: "Mar, Marina ou Baía", amenities: "Varanda, Chaleira Elétrica, Smart TV" },
  { name: "Family Room", size: "31-32 m²", view: "Piscina ou Marina", amenities: "Sofá-cama, Área de Estar, Varanda" },
  { name: "Junior Suite", size: "30 m²", view: "Marina", amenities: "Design Superior, Roupões, Área de estar" },
  { name: "Suite Sea View", size: "31 m²", view: "Baía do Mindelo", amenities: "Piso elevado, Chaleira, Vista Premium" },
  { name: "Suite com Piscina Privativa", size: "31-68 m²", view: "Marina / Oceano", amenities: "Plunge pool na varanda, Jacuzzi, Entrada privada" },
];

const Guide = () => {
  const [view, setView] = useState<"list" | "floors" | "rooms">("list");

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex bg-muted/40 p-1 rounded-full border border-border/40 overflow-x-auto [scrollbar-width:none]">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${view === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Lista
            </button>
            <button
              onClick={() => setView("floors")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${view === "floors" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Pisos
            </button>
            <button
              onClick={() => setView("rooms")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${view === "rooms" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Quartos
            </button>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Ouril Mindelo<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Diretório Interno</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Tudo o que precisa saber sobre as nossas instalações e serviços.
          </p>
        </div>

        {view === "list" ? (
          <div className="space-y-6 pb-12">
            {FACILITIES.map((facility, idx) => (
              <div key={idx} className="group">
                <div className="relative h-48 w-full rounded-3xl overflow-hidden glass shadow-elevated">
                  <img src={facility.img} alt={facility.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase tracking-wider text-primary bg-background/50 backdrop-blur px-2 py-0.5 rounded-full border border-primary/20">
                        {facility.category}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted/80 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {facility.floor}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-semibold">{facility.title}</h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 pl-3 border-l-2 border-primary/40 leading-relaxed">
                  {facility.desc}
                </p>
              </div>
            ))}
          </div>
        ) : view === "floors" ? (
          <div className="pb-12 space-y-4">
            <div className="glass rounded-3xl p-5 border-l-4 border-l-primary/60">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Piso Superior
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Piscina Infinita</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bar de Rooftop & Solário</li>
              </ul>
            </div>
            
            <div className="glass rounded-3xl p-5 border-l-4 border-l-primary/40">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Piso 6
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Restaurante Américos (Pequeno-almoço)</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Piscina Interior Aquecida</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Fitness Suite & Jacuzzi</li>
              </ul>
            </div>

            <div className="glass rounded-3xl p-5 border-l-4 border-l-primary/20">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Pisos 1 a 5
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Alojamentos & Suites</li>
              </ul>
            </div>

            <div className="glass rounded-3xl p-5 border-l-4 border-l-muted-foreground/40">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Piso 0 (Lobby)
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Receção 24h & ATM / Câmbio</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Piscina Exterior Pátio Central</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Sala de Conferências</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="pb-12 space-y-3">
            {ROOM_TYPES.map((room) => (
              <div key={room.name} className="glass rounded-2xl p-4">
                <h3 className="font-display font-bold text-primary">{room.name}</h3>
                <div className="mt-2 grid grid-cols-2 gap-y-2 text-[11px]">
                  <div className="text-muted-foreground">Área: <span className="text-foreground font-medium">{room.size}</span></div>
                  <div className="text-muted-foreground text-right">Vista: <span className="text-foreground font-medium">{room.view}</span></div>
                  <div className="col-span-2 text-muted-foreground border-t border-border/20 pt-2 mt-1">
                    Comodidades: <span className="text-foreground font-medium">{room.amenities}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Guide;
