import { useState } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Thermometer, Wine, Flower2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHotel } from "@/components/HotelProvider";

const PreArrival = () => {
  const { user } = useAuth();
  const { activeHotel } = useHotel();
  const roomNumber = (user?.user_metadata as any)?.room_number ?? "412";
  const [temp, setTemp] = useState<number[]>([22]);
  const [champagne, setChampagne] = useState(false);
  const [flowers, setFlowers] = useState(false);
  const [fruits, setFruits] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    haptic("success");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const extras = [
          champagne && "Champanhe",
          flowers && "Flores",
          fruits && "Cesta de Frutas",
        ].filter(Boolean).join(", ");
        await supabase.from("service_requests").insert({
          user_id: user.id,
          service_type: "Pre-Arrival",
          description: `Temp: ${temp[0]}°C. Extras: ${extras || "Nenhum"}`,
          room_number: roomNumber,
          hotel_id: activeHotel?.id,
        });
      }
    } catch {}
    setSubmitted(true);
    toast.success("Preferências guardadas!", {
      description: "O seu quarto estará pronto à sua chegada."
    });
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-center mt-24">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
            <Check className="h-10 w-10 text-primary-foreground" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-3xl font-semibold mt-6">Tudo preparado.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            O seu quarto será ajustado a {temp[0]}°C antes da sua chegada.
            {champagne && " Uma garrafa de Champanhe estará à sua espera."}
            {flowers && " Arranjo floral fresco no quarto."}
            {fruits && " Cesta de frutas tropicais frescas."}
          </p>
          <Link to="/" className="inline-block mt-8 rounded-full glass px-6 py-3 text-sm hover:border-primary/40 transition">
            Voltar ao início
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pré-Chegada</p>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Personalização</p>
          <h1 className="font-display text-3xl font-semibold mt-1">Prepare a sua suite<br/>antes de chegar.</h1>
          <p className="text-sm text-muted-foreground mt-2">Defina a temperatura e escolha surpresas para encontrar no quarto.</p>
        </div>

        {/* Temperatura de chegada */}
        <section className="mt-8 glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
                <Thermometer className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clima à Chegada</p>
                <p className="text-sm font-medium">Temperatura desejada</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {temp[0]}<span className="text-sm text-muted-foreground">°C</span>
            </p>
          </div>
          <Slider value={temp} onValueChange={setTemp} min={18} max={26} step={1} className="mt-5" />
        </section>

        {/* Extras de boas-vindas */}
        <section className="mt-4 glass rounded-3xl divide-y divide-border/40">
          <div className="flex items-center gap-4 p-5">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <Wine className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Champanhe de Boas-vindas</p>
              <p className="text-[11px] text-muted-foreground">Garrafa fresca no balde de gelo · €45</p>
            </div>
            <Switch checked={champagne} onCheckedChange={(v) => { setChampagne(v); haptic("tap"); }} />
          </div>
          <div className="flex items-center gap-4 p-5">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <Flower2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Arranjo Floral</p>
              <p className="text-[11px] text-muted-foreground">Flores tropicais frescas · €25</p>
            </div>
            <Switch checked={flowers} onCheckedChange={(v) => { setFlowers(v); haptic("tap"); }} />
          </div>
          <div className="flex items-center gap-4 p-5">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <span className="text-lg">🍇</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Cesta de Frutas Tropicais</p>
              <p className="text-[11px] text-muted-foreground">Manga, papaia e banana de Cabo Verde · €18</p>
            </div>
            <Switch checked={fruits} onCheckedChange={(v) => { setFruits(v); haptic("tap"); }} />
          </div>
        </section>

        <button
          onClick={handleSubmit}
          className="mt-8 w-full rounded-full bg-gradient-primary text-primary-foreground py-4 text-sm font-medium shadow-glow active:scale-[0.99] transition"
        >
          Confirmar Preferências
        </button>
      </div>
    </AppShell>
  );
};

export default PreArrival;
