import AppShell from "@/components/AppShell";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import santo from "@/assets/experience-santoantao.jpg";
import morna from "@/assets/experience-morna.jpg";
import sailing from "@/assets/experience-sailing.jpg";
import laginha from "@/assets/experience-laginha.jpg";

const items = [
  {
    img: santo,
    title: "Travessia para Santo Antão",
    place: "Porto Novo · dia inteiro",
    price: "€185",
    rating: 4.9,
    tag: "Mais procurada",
  },
  {
    img: morna,
    title: "Jantar com Morna ao vivo",
    place: "Café Musique · 20h",
    price: "€72",
    rating: 4.8,
    tag: "Cultura",
  },
  {
    img: sailing,
    title: "Aluguer privado de veleiro",
    place: "Marina Mindelo · 4h",
    price: "€420",
    rating: 5.0,
    tag: "Premium",
  },
  {
    img: laginha,
    title: "Sunset na Praia da Laginha",
    place: "Bar Praiamar · 18h",
    price: "€38",
    rating: 4.7,
    tag: "Sunset",
  },
];

const Experiences = () => {
  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Marketplace</p>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Experiências<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Mindelo curadas</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Selecionadas pelos nossos concierges locais. Reserva instantânea no quarto.
          </p>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
          {["Tudo", "Cultura", "Mar", "Gastronomia", "Natureza"].map((c, i) => (
            <button
              key={c}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                i === 0
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 mt-6">
          {items.map((it) => (
            <article
              key={it.title}
              className="group relative overflow-hidden rounded-3xl glass shadow-elevated"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider text-primary border border-primary/30 bg-background/40 backdrop-blur rounded-full px-2 py-1">
                  {it.tag}
                </span>
              </div>
              <div className="p-5 -mt-8 relative">
                <h3 className="font-display text-xl font-semibold">{it.title}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {it.place.split("·")[0]}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{it.place.split("·")[1]}</span>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-medium">{it.rating}</span>
                    <span className="text-muted-foreground">· por pessoa</span>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-semibold">{it.price}</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-full bg-gradient-primary text-primary-foreground py-3 text-sm font-medium shadow-glow active:scale-[0.98] transition">
                  Reservar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Experiences;