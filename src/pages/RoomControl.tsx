import { useState } from "react";
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
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type SceneId = "morning" | "focus" | "sunset" | "night";

const SCENES: { id: SceneId; label: string; icon: typeof Sun; hint: string }[] = [
  { id: "morning", label: "Manhã", icon: Sun, hint: "Luz natural · 80%" },
  { id: "focus", label: "Foco", icon: Sparkles, hint: "Neutro · 100%" },
  { id: "sunset", label: "Pôr-do-sol", icon: Sunset, hint: "Quente · 45%" },
  { id: "night", label: "Noite", icon: Moon, hint: "Âmbar · 8%" },
];

const RoomControl = () => {
  const [scene, setScene] = useState<SceneId>("sunset");
  const [temp, setTemp] = useState<number[]>([22]);
  const [blinds, setBlinds] = useState<number[]>([60]);
  const [dnd, setDnd] = useState(false);
  const [breakfast, setBreakfast] = useState(true);

  const pickScene = (id: SceneId) => {
    setScene(id);
    haptic("soft");
  };

  return (
    <AppShell>
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

        {/* Scenes */}
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Cenas</h2>
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
                  <span className="text-[11px] font-medium">{s.label}</span>
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
              <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
                <Thermometer className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Climate</p>
                <p className="text-sm font-medium">Temperatura ideal</p>
              </div>
            </div>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {temp[0]}<span className="text-sm text-muted-foreground">°C</span>
            </p>
          </div>
          <Slider
            value={temp}
            onValueChange={(v) => { setTemp(v); haptic("tap"); }}
            min={17}
            max={28}
            step={1}
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
      </div>
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