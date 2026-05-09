import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sun,
  Moon,
  Sunset,
  Sparkles,
  Thermometer,
  Blinds,
  BellOff,
  Coffee,
  ShieldCheck,
  Lightbulb,
  Fan,
  Info,
  AlarmClock
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type SceneId = "bom-dia" | "por-do-sol" | "cinema" | "eco-glow";

const SCENES: { id: SceneId; label: string; icon: typeof Sun; hint: string }[] = [
  { id: "bom-dia", label: "Bom Dia", icon: Sun, hint: "Cortinas 100% · AC off" },
  { id: "por-do-sol", label: "Pôr-do-sol", icon: Sunset, hint: "Luz Quente · Cortinas 50%" },
  { id: "cinema", label: "Cinema", icon: Moon, hint: "Luzes 0% · AC Silencioso" },
  { id: "eco-glow", label: "Eco-Glow", icon: Sparkles, hint: "AC 24°C · Luzes 30%" },
];

const RoomControl = () => {
  const [scene, setScene] = useState<SceneId>("por-do-sol");
  const [temp, setTemp] = useState<number[]>([22]);
  const [blinds, setBlinds] = useState<number[]>([50]);
  const [lights, setLights] = useState<number[]>([60]);
  const [acPower, setAcPower] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [breakfast, setBreakfast] = useState(true);
  const [ecoMode, setEcoMode] = useState(false);
  const [smartWakeup, setSmartWakeup] = useState(false);

  // Debounced Sync to Supabase
  useEffect(() => {
    const syncTimeout = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;
        await supabase.from('room_settings').insert([{
          user_id: user.id,
          temperature: temp[0],
          blinds_level: blinds[0],
          lights_level: lights[0],
          ac_power: acPower
        }]);
      } catch (err) {
        console.error("Erro ao sincronizar sala:", err);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(syncTimeout);
  }, [temp, blinds, lights, acPower]);

  const pickScene = (id: SceneId) => {
    setScene(id);
    haptic("soft");
    
    if (id === "bom-dia") {
      setBlinds([100]);
      setLights([20]);
      setAcPower(false);
      setEcoMode(false);
    } else if (id === "por-do-sol") {
      setBlinds([50]);
      setLights([60]);
      setTemp([22]);
      setAcPower(true);
      setEcoMode(false);
    } else if (id === "cinema") {
      setBlinds([0]);
      setLights([0]);
      setTemp([24]);
      setAcPower(true);
      setEcoMode(false);
    } else if (id === "eco-glow") {
      setBlinds([40]);
      setLights([30]);
      setTemp([24]);
      setAcPower(true);
      setEcoMode(true);
    }
  };

  const handleEcoToggle = (v: boolean) => {
    setEcoMode(v);
    if (v) {
      pickScene("eco-glow");
      haptic("success");
    } else {
      haptic("tap");
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Suite 412</p>
            <div className="h-10 w-10" />
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Ambient Control</p>
            <h1 className="font-display text-3xl font-semibold mt-1">O quarto, à sua vontade.</h1>
          </div>

          {/* Eco Mode Banner */}
          <section className={cn(
            "mt-6 rounded-3xl p-5 border transition-all duration-500",
            ecoMode 
              ? "bg-primary/10 border-primary/30 shadow-glow" 
              : "glass border-border/40"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-2xl grid place-items-center transition-colors",
                  ecoMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">Eco-Luxury Mode</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-center">
                        <p>Otimiza a temperatura e as luzes para reduzir a pegada de carbono sem comprometer o conforto.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {ecoMode ? "Economizando 12% de energia" : "Ative para otimizar o consumo"}
                  </p>
                </div>
              </div>
              <Switch checked={ecoMode} onCheckedChange={handleEcoToggle} />
            </div>
          </section>

          {/* Scenes */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cenas Inteligentes</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-center">
                  <p>As cenas automatizam luzes, ar condicionado e cortinas com um único toque.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
            {SCENES.map((s) => {
              const active = s.id === scene;
              return (
                <button
                  key={s.id}
                  onClick={() => pickScene(s.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-2xl p-3 flex flex-col items-center gap-2 border transition-all duration-300 active:scale-[0.97]",
                    active
                      ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                      : "glass text-muted-foreground hover:text-foreground"
                  )}
                >
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium text-center leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {SCENES.find((s) => s.id === scene)?.hint}
          </p>
        </section>

        {/* Climate */}
        <section className="mt-8 glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-9 w-9 rounded-xl grid place-items-center transition-colors",
                acPower ? "bg-muted text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <Fan className={cn("h-4 w-4", acPower && "animate-pulse-slow")} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Climate</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Ar Condicionado</p>
                  <Switch checked={acPower} onCheckedChange={(v) => { setAcPower(v); haptic("tap"); }} className="scale-75" />
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              {ecoMode && <span className="text-[10px] font-bold text-primary animate-pulse">ECO</span>}
              <p className={cn(
                "font-display text-3xl font-semibold tabular-nums transition-opacity",
                !acPower && "opacity-40"
              )}>
                {temp[0]}<span className="text-sm text-muted-foreground">°C</span>
              </p>
            </div>
          </div>
          <Slider
            value={temp}
            onValueChange={(v) => { setTemp(v); haptic("tap"); }}
            min={ecoMode ? 21 : 16}
            max={ecoMode ? 26 : 30}
            step={1}
            disabled={!acPower}
            className={cn("mt-5 transition-opacity", !acPower && "opacity-40")}
          />
        </section>

        {/* Lights */}
        <section className="mt-4 glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
                <Lightbulb className={cn("h-4 w-4", lights[0] > 0 ? "text-amber-400" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Iluminação</p>
                <p className="text-sm font-medium">Luzes Principais</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {lights[0]}<span className="text-sm text-muted-foreground">%</span>
            </p>
          </div>
          <Slider
            value={lights}
            onValueChange={(v) => { setLights(v); haptic("tap"); }}
            min={0}
            max={100}
            step={5}
            className="mt-5"
          />
        </section>

        {/* Blinds */}
        <section className="mt-4 glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
                <Blinds className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cortinas</p>
                <p className="text-sm font-medium">Vista para o Porto Grande</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {blinds[0]}<span className="text-sm text-muted-foreground">%</span>
            </p>
          </div>
          <Slider
            value={blinds}
            onValueChange={(v) => { setBlinds(v); haptic("tap"); }}
            min={0}
            max={100}
            step={5}
            className="mt-5"
          />
        </section>

        {/* Toggles */}
        <section className="mt-4 glass rounded-3xl divide-y divide-border/40">
          <ToggleRow
            icon={BellOff}
            title="Não incomodar"
            subtitle="Pausa serviço, limpeza e notificações"
            checked={dnd}
            onCheckedChange={(v) => { setDnd(v); haptic(v ? "success" : "tap"); }}
          />
          <ToggleRow
            icon={Coffee}
            title="Pequeno-almoço no quarto"
            subtitle="Amanhã, 08:00 · Continental"
            checked={breakfast}
            onCheckedChange={(v) => { setBreakfast(v); haptic("tap"); }}
          />
          <ToggleRow
            icon={AlarmClock}
            title="Despertar Inteligente"
            subtitle={smartWakeup ? "07:30 · Cortinas abrem suavemente + luz quente" : "Desativado · toque para ativar"}
            checked={smartWakeup}
            onCheckedChange={(v) => { 
              setSmartWakeup(v); 
              haptic(v ? "success" : "tap"); 
              if (v) {
                import("sonner").then(({ toast }) => toast.success("Despertar às 07:30 ativado", {
                  description: "Cortinas abrirão a 30%, luz quente e AC ajustado a 23°C."
                }));
              }
            }}
          />
          <div className="flex items-center gap-4 p-5">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Cofre</p>
              <p className="text-[11px] text-muted-foreground">Trancado · última abertura 14:08</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/20 rounded-full px-2 py-1">
              Seguro
            </span>
          </div>
        </section>

        {/* Menu de Conforto / Pillow Menu */}
        <section className="mt-6 mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Menu de Conforto</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Almofada Ortopédica", emoji: "🛏️" },
              { label: "Almofada de Penas", emoji: "🪶" },
              { label: "Edredom Extra", emoji: "☁️" },
              { label: "Roupão & Chinelos", emoji: "👘" },
              { label: "Kit de Barbear", emoji: "🪒" },
              { label: "Toalhas Extra", emoji: "🧖" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={async () => {
                  haptic("success");
                  try {
                    const { data: { user: u } } = await supabase.auth.getUser();
                    if (u?.id) {
                      await supabase.from("service_requests").insert({
                        user_id: u.id,
                        service_type: "Conforto",
                        description: item.label,
                        room_number: "412",
                      });
                      window.dispatchEvent(new CustomEvent("mh:account-update"));
                    }
                  } catch (err) { console.warn(err); }
                  import("sonner").then(({ toast }) => toast.success(`${item.label} solicitado`, {
                    description: "A governanta entregará na sua suite em breve."
                  }));
                }}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 transition-all active:scale-[0.97] border border-border/40"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
      </TooltipProvider>
    </AppShell>
  );
};

const ToggleRow = ({
  icon: Icon,
  title,
  subtitle,
  checked,
  onCheckedChange,
}: {
  icon: typeof Sun;
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) => (
  <div className="flex items-center gap-4 p-5">
    <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default RoomControl;