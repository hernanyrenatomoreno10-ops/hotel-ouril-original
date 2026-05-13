import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useHotel } from "@/components/HotelProvider";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const HOLD_DURATION = 5000; // 5 seconds
const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SOSButton() {
  const { user } = useAuth();
  const { activeHotel } = useHotel();
  const [progress, setProgress] = useState(0); // 0–100
  const [triggered, setTriggered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const roomNumber = (user?.user_metadata as any)?.room_number ?? "—";

  const cancelHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (triggered) return;
    haptic("tap");
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        triggerSOS();
      }
    }, 30);
  }, [triggered]);

  const triggerSOS = async () => {
    haptic("success");
    setTriggered(true);
    setProgress(100);

    // Vibrate pattern for SOS (if supported)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u?.id) {
        await supabase.from("service_requests").insert({
          user_id: u.id,
          service_type: "SOS",
          description: `🚨 EMERGÊNCIA — Hóspede ${roomNumber} necessita de assistência imediata.`,
          room_number: roomNumber,
          hotel_id: activeHotel?.id,
          status: "pending",
        });
      }
    } catch (err) {
      console.error("SOS insert failed:", err);
    }

    // Auto-reset after 30 seconds
    setTimeout(() => {
      setTriggered(false);
      setProgress(0);
      setExpanded(false);
    }, 30000);
  };

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="fixed bottom-36 right-4 z-50 flex flex-col items-end gap-2">
      {/* Label */}
      {expanded && !triggered && (
        <div className="animate-in slide-in-from-right-2 fade-in duration-200 bg-card border border-border rounded-2xl px-3 py-2 text-xs shadow-lg max-w-[160px] text-center">
          <p className="font-bold text-destructive">Botão SOS</p>
          <p className="text-muted-foreground mt-0.5 leading-tight">Pressione e segure 5 segundos para chamar ajuda</p>
        </div>
      )}

      {/* Triggered Message */}
      {triggered && (
        <div className="animate-in slide-in-from-right-2 fade-in duration-300 bg-destructive/10 border border-destructive/30 rounded-2xl px-3 py-2 text-xs shadow-lg max-w-[180px] text-center">
          <p className="font-bold text-destructive">🚨 Alerta enviado!</p>
          <p className="text-muted-foreground mt-0.5 leading-tight">
            A equipa está a caminho da suite {roomNumber}.
          </p>
        </div>
      )}

      {/* SOS Button */}
      <button
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onClick={() => !triggered && setExpanded(v => !v)}
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg select-none transition-all duration-300 touch-none",
          triggered
            ? "bg-destructive shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-110"
            : progress > 0
            ? "bg-destructive/80 scale-105"
            : "bg-destructive/90 hover:bg-destructive active:scale-95"
        )}
        style={{ WebkitUserSelect: "none" }}
        aria-label="Botão SOS de emergência"
      >
        {/* SVG Progress Ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width="56"
          height="56"
          viewBox="0 0 60 60"
        >
          <circle
            cx="30"
            cy="30"
            r={RADIUS}
            fill="none"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="3"
          />
          <circle
            cx="30"
            cy="30"
            r={RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-none"
          />
        </svg>

        {/* Icon */}
        <span
          className={cn(
            "relative z-10 text-white font-black text-sm tracking-tighter leading-none",
            triggered && "animate-pulse"
          )}
        >
          {triggered ? "🚨" : "SOS"}
        </span>

        {/* Pulse ring when triggered */}
        {triggered && (
          <>
            <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-50" />
            <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-30 [animation-delay:400ms]" />
          </>
        )}
      </button>
    </div>
  );
}
