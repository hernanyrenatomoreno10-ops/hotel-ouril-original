import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, ShoppingBag, Star, Clock, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHotel } from "@/components/HotelProvider";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_eur: number;
  price_cve: number;
  image_url: string | null;
  popular: boolean | null;
};

const Gastronomy = () => {
  const { user } = useAuth();
  const { activeHotel } = useHotel();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat] = useState("Destaques");
  const [showCVE, setShowCVE] = useState(false);

  useEffect(() => {
    let query = supabase.from("gastronomy_items").select("*");
    if (activeHotel) {
      query = query.eq("hotel_id", activeHotel.id);
    }
    query.then(({ data }) => {
      if (data) setItems(data as MenuItem[]);
    });
  }, [activeHotel?.id]);

  const cats = ["Destaques", ...Array.from(new Set(items.map((i) => i.category || "Outros")))];
  const visible = activeCat === "Destaques"
    ? items.filter((i) => i.popular)
    : items.filter((i) => (i.category || "Outros") === activeCat);

  const formatPrice = (i: MenuItem) =>
    showCVE ? `${Math.round(i.price_cve).toLocaleString("pt-PT")} CVE` : `€${i.price_eur}`;

  const addToCart = async (item: MenuItem) => {
    setCart((c) => [...c, item]);
    haptic("success");
    toast.success(`${item.name} adicionado ao pedido`, {
      description: "Será entregue na sua suite em 30-40 min.",
    });
    if (user?.id) {
      await supabase.from("gastronomy_orders").insert({
        user_id: user.id,
        item_id: item.id,
        item_name: item.name,
        price: item.price_eur,
        status: "pending",
        hotel_id: activeHotel?.id,
        room_number: ((user.user_metadata as any)?.room_number ?? "412"),
      });
      window.dispatchEvent(new CustomEvent("mh:account-update"));
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            onClick={() => { setShowCVE((v) => !v); haptic("tap"); }}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition"
          >
            {showCVE ? "CVE · tocar para €" : "EUR · tocar para CVE"}
          </button>
          <div className="relative">
            <div className="glass h-10 w-10 rounded-full grid place-items-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full grid place-items-center animate-in zoom-in">
                {cart.length}
              </span>
            )}
          </div>
        </header>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Ouril <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">{activeHotel?.name.split(" ")[1] || "Restaurant"} & Bar</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Alta gastronomia cabo-verdiana, servida na suite ou no rooftop.
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-6 overflow-x-auto -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => { setActiveCat(c); haptic("tap"); }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                activeCat === c
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-8 space-y-6">
          {visible.map((item) => (
            <div key={item.id} className="group relative">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/40">
                  <img
                    src={item.image_url ?? "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  {item.popular && (
                    <div className="absolute top-1 left-1 bg-primary/90 backdrop-blur-sm text-[8px] font-bold text-primary-foreground px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                      Chef's Choice
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                    <span className="font-display font-bold text-primary tabular-nums">{formatPrice(item)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 35m</span>
                      <span className="flex items-center gap-1 text-primary"><Star className="h-3 w-3 fill-primary" /> 4.9</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="h-8 px-4 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all active:scale-95"
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* Cart Fixed Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-32 left-6 right-6 z-40 animate-fade-up">
            <button className="w-full glass bg-primary/20 backdrop-blur-2xl border-primary/30 rounded-2xl p-4 flex items-center justify-between shadow-glow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                  <Utensils className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-primary">Finalizar Pedido</p>
                  <p className="text-sm font-semibold">{cart.length} itens selecionados</p>
                </div>
              </div>
              <p className="font-display text-xl font-bold tabular-nums">
                €{cart.reduce((a, i) => a + Number(i.price_eur), 0).toFixed(2)}
              </p>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Gastronomy;
