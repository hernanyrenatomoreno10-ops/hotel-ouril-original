import { useEffect, useState } from "react";
import { Sunset, Wind, Waves, Moon } from "lucide-react";

/**
 * LivingContext — a quietly animated, real-time ambient strip.
 * Shows sunset countdown, sea state and wind for Mindelo. Updates each second
 * without re-rendering parents (self-contained state).
 */
const SUNSET_HOUR = 18;
const SUNSET_MINUTE = 42;

const fmtCountdown = (ms: number) => {
  if (ms <= 0) return "Agora";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const LivingContext = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const target = new Date(now);
  target.setHours(SUNSET_HOUR, SUNSET_MINUTE, 0, 0);
  const diff = target.getTime() - now.getTime();
  const past = diff <= 0;

  const items = [
    {
      icon: past ? Moon : Sunset,
      label: past ? "Lua cheia" : "Pôr-do-sol",
      value: past ? "21:14" : fmtCountdown(diff),
      live: !past,
    },
    { icon: Waves, label: "Mar", value: "Calmo · 0.6m", live: false },
    { icon: Wind, label: "Alísio", value: "12 kn NE", live: false },
  ];

  return (
    <section
      aria-label="Contexto ambiental ao vivo"
      className="px-6 mt-6"
    >
      <div className="glass rounded-2xl p-3 grid grid-cols-3 divide-x divide-border/40">
        {items.map((it) => (
          <div key={it.label} className="px-3 first:pl-2 last:pr-2 flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 shrink-0 rounded-xl bg-muted/60 grid place-items-center">
              <it.icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1">
                {it.label}
                {it.live && (
                  <span className="inline-block h-1 w-1 rounded-full bg-primary animate-pulse-glow" />
                )}
              </p>
              <p className="text-xs font-medium tabular-nums truncate">{it.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LivingContext;