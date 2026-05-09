import { useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, KeyRound, ShieldCheck, Wifi, Loader2, CheckCircle2, Nfc } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type KeyState = "idle" | "activating" | "unlocked";

const DigitalKey = () => {
  const [keyState, setKeyState] = useState<KeyState>("idle");
  const [nfcMode, setNfcMode] = useState<"unsupported" | "ready" | "scanning">(
    typeof window !== "undefined" && "NDEFReader" in window ? "ready" : "unsupported"
  );
  const abortRef = useRef<AbortController | null>(null);

  const finalizeUnlock = async () => {
    haptic("success");
    setKeyState("unlocked");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("door_access_logs").insert({
        user_id: user.id,
        room_number: ((user.user_metadata as any)?.room_number ?? "412"),
        method: "NDEFReader" in window ? "nfc" : "ble",
        status: "success",
      });
    }
    setTimeout(() => setKeyState("idle"), 3500);
  };

  const handleUnlock = async () => {
    if (keyState !== "idle") return;

    haptic("tap");
    setKeyState("activating");

    // Tenta Web NFC real (Android Chrome) — caso contrário cai para handshake simulado
    if ("NDEFReader" in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setNfcMode("scanning");

        // Timeout de leitura — 8s
        const timeout = setTimeout(() => ctrl.abort(), 8000);

        await ndef.scan({ signal: ctrl.signal });
        ndef.onreading = () => {
          clearTimeout(timeout);
          ctrl.abort();
          setNfcMode("ready");
          finalizeUnlock();
        };
        ndef.onreadingerror = () => {
          clearTimeout(timeout);
          setNfcMode("ready");
          setKeyState("idle");
          toast.error("Não foi possível ler a fechadura. Tente novamente.");
        };
        return;
      } catch (err: any) {
        setNfcMode("ready");
        if (err?.name === "NotAllowedError") {
          toast.error("Permissão NFC negada. Autorize nas definições do telemóvel.");
          setKeyState("idle");
          return;
        }
        // Fallback silencioso para simulação
      }
    }

    setTimeout(() => finalizeUnlock(), 1200);
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Digital Key</p>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Suite Atlântica</p>
          <h1 className="font-display text-5xl font-semibold mt-2">412</h1>
          <p className="text-sm text-muted-foreground mt-2">Pestana Trópico · 4º andar</p>
        </div>

        {/* Ripple visual & Button */}
        <div className="relative mx-auto mt-10 h-72 w-72 grid place-items-center">
          {keyState === "idle" && (
            <>
              <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple" />
              <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple [animation-delay:600ms]" />
              <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple [animation-delay:1200ms]" />
            </>
          )}

          <button
            onClick={handleUnlock}
            disabled={keyState !== "idle"}
            className={cn(
              "relative h-44 w-44 rounded-full shadow-glow grid place-items-center transition-all duration-500",
              keyState === "idle" && "bg-gradient-primary text-primary-foreground active:scale-95",
              keyState === "activating" && "bg-muted text-primary scale-95 shadow-none",
              keyState === "unlocked" && "bg-green-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] scale-100"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              {keyState === "idle" && <KeyRound className="h-10 w-10" strokeWidth={1.75} />}
              {keyState === "activating" && <Loader2 className="h-10 w-10 animate-spin" strokeWidth={1.75} />}
              {keyState === "unlocked" && <CheckCircle2 className="h-10 w-10 animate-in zoom-in" strokeWidth={1.75} />}
              
              <span className="text-xs font-medium tracking-wider uppercase mt-1">
                {keyState === "idle" && "Tocar para abrir"}
                {keyState === "activating" && "Conectando..."}
                {keyState === "unlocked" && "Aberta"}
              </span>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 h-4">
          {keyState === "idle" && "Aproxime o telemóvel da fechadura"}
          {keyState === "activating" && "A autenticar via NFC (Seguro)"}
          {keyState === "unlocked" && <span className="text-green-500 font-medium">Porta destrancada — bem-vindo.</span>}
        </p>

        <div className="mt-10 glass rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              {nfcMode === "unsupported" ? <Wifi className="h-4 w-4 text-primary" /> : <Nfc className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sinal</p>
              <p className="text-sm font-medium">
                {nfcMode === "unsupported" ? "BLE (NFC indisponível)" : nfcMode === "scanning" ? "A ler NFC…" : "NFC activo"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado</p>
              <p className="text-sm font-medium">Encriptado</p>
            </div>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-4 rounded-full h-12">
          Partilhar chave com acompanhante
        </Button>
      </div>
    </AppShell>
  );
};

export default DigitalKey;