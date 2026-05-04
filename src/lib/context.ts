import { useEffect, useState } from "react";

export type DayPhase = "morning" | "day" | "evening" | "night";

export const getDayPhase = (date: Date = new Date()): DayPhase => {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
};

export const useDayPhase = () => {
  const [phase, setPhase] = useState<DayPhase>(() => getDayPhase());
  useEffect(() => {
    const id = setInterval(() => setPhase(getDayPhase()), 60_000);
    return () => clearInterval(id);
  }, []);
  return phase;
};

export const phaseClass = (phase: DayPhase) =>
  phase === "morning" ? "ctx-morning"
  : phase === "day" ? "ctx-day"
  : phase === "evening" ? "ctx-evening"
  : "ctx-night";

export const phaseGreeting = (phase: DayPhase) =>
  phase === "morning" ? "Bom dia"
  : phase === "day" ? "Boa tarde"
  : phase === "evening" ? "Boa tarde"
  : "Boa noite";