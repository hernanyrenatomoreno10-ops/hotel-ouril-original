import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Clock, MapPin, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHotel } from "@/components/HotelProvider";
import santo from "@/assets/experience-santoantao.jpg";
import morna from "@/assets/experience-morna.jpg";
import sailing from "@/assets/experience-sailing.jpg";
import laginha from "@/assets/experience-laginha.jpg";

const SEED_ITEMS: any[] = [
  {
    title: "Sunset na Piscina Infinita",
    place: "Rooftop · 18:00",
    price: "€25",
    rating: 4.9,
    tag: "Exclusivo",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1024",
    is_internal: true
  },
  {
    title: "Ritual SPA Ouril Relax",
    place: "Ouril SPA · 90min",
    price: "€85",
    rating: 4.8,
    tag: "Bem-estar",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1024",
    is_internal: true
  },
  {
    title: "Degustação Vinhos do Fogo",
    place: "Restaurante Américos · 19:30",
    price: "€45",
    rating: 5.0,
    tag: "Gastronomia",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1024",
    is_internal: true
  },
  {
    title: "Yoga Matinal no Pátio",
    place: "Pátio Central · 08:00",
    price: "€15",
    rating: 4.7,
    tag: "Saúde",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1024",
    is_internal: true
  },
];

const Experiences = () => {
  const { user } = useAuth();
  const { activeHotel } = useHotel();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tudo");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [dbItems, setDbItems] = useState<any[]>([]);

  useEffect(() => {
    fetchExperiences();
  }, [activeHotel?.id]);

  const fetchExperiences = async () => {
    try {
      let query = supabase.from('experiences').select('*');
      if (activeHotel) {
        query = query.eq('hotel_id', activeHotel.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        // Internas do Ouril primeiro
        const sorted = [...data].sort((a: any, b: any) => Number(b.is_internal) - Number(a.is_internal));
        setDbItems(sorted.map((d: any) => ({
          id: d.id,
          title: d.title,
          place: d.place,
          price: `€${d.price_eur}`,
          price_eur: Number(d.price_eur),
          rating: Number(d.rating),
          tag: d.tag,
          img: d.image_url,
          is_internal: d.is_internal,
        })));
      } else {
        setDbItems(SEED_ITEMS);
      }
    } catch (err) {
      console.error("Erro ao buscar experiências:", err);
      setDbItems(SEED_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const currentItems = dbItems;

  const filteredItems = currentItems.filter(
    (it) => activeCategory === "Tudo" || it.tag.includes(activeCategory) || (activeCategory === "Mar" && it.title.includes("veleiro")) || (activeCategory === "Natureza" && it.title.includes("Santo Antão"))
  );

  const handleReserve = async (item: any) => {
    setReservingId(item.title);
    haptic("tap");

    if (!user?.id) {
      toast.error("Sessão expirada. Por favor entre novamente.");
      setReservingId(null);
      return;
    }
    try {
      const { error } = await supabase.from("experience_reservations").insert({
        experience_id: item.id || null,
        title: item.title,
        place: item.place,
        price_eur: item.price_eur ?? 45,
        status: "confirmed",
        user_id: user.id,
        hotel_id: activeHotel?.id,
      });
      if (error) throw error;
      haptic("success");
      toast.success(`${item.title} reservado.`, {
        description: "O Soul Concierge foi notificado.",
      });
      window.dispatchEvent(new CustomEvent("mh:account-update"));
    } catch (err: any) {
      console.error(err);
      toast.error("Não conseguimos confirmar agora. Tentemos novamente?");
    } finally {
      setReservingId(null);
    }
  };

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
            <span className="bg-gradient-primary bg-clip-text text-transparent">{activeHotel?.city || "Mindelo"} curadas</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Selecionadas pelos nossos concierges locais. Reserva instantânea no quarto.
          </p>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
          {["Tudo", "Cultura", "Mar", "Gastronomia", "Natureza"].map((c) => (
            <button
              key={c}
              onClick={() => { setActiveCategory(c); haptic("tap"); }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                activeCategory === c
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 mt-6 pb-10">
          {loading ? (
            // Skeleton State
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl overflow-hidden shadow-elevated animate-pulse">
                <div className="h-56 bg-muted/40" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-2/3 bg-muted rounded-lg" />
                  <div className="h-4 w-1/3 bg-muted rounded-lg" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-16 bg-muted rounded-lg" />
                    <div className="h-8 w-24 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredItems.map((it) => (
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
                  {it.is_internal && (
                    <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-primary-foreground bg-primary/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Ouril
                    </span>
                  )}
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
                  <button 
                    onClick={() => handleReserve(it)}
                    disabled={reservingId === it.title}
                    className="mt-4 w-full flex items-center justify-center rounded-full bg-gradient-primary text-primary-foreground py-3 text-sm font-medium shadow-glow active:scale-[0.98] transition disabled:opacity-70 disabled:scale-100"
                  >
                    {reservingId === it.title ? "Reservando..." : "Reservar"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Experiences;