import { useState } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, KeyRound, ShieldCheck, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DigitalKey = () => {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    setUnlocked(true);
    setTimeout(() => setUnlocked(false), 3500);
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

        {/* Ripple visual */}
        <div className="relative mx-auto mt-10 h-72 w-72 grid place-items-center">
          <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple" />
          <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple [animation-delay:600ms]" />
          <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple [animation-delay:1200ms]" />

          <button
            onClick={handleUnlock}
            className="relative h-44 w-44 rounded-full bg-gradient-primary text-primary-foreground shadow-glow grid place-items-center transition-transform active:scale-95"
          >
            <div className="flex flex-col items-center gap-2">
              <KeyRound className="h-10 w-10" strokeWidth={1.75} />
              <span className="text-xs font-medium tracking-wider uppercase">
                {unlocked ? "Aberta" : "Tocar para abrir"}
              </span>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {unlocked ? "Porta destrancada — bem-vindo." : "Aproxime o telemóvel da fechadura"}
        </p>

        <div className="mt-10 glass rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <Wifi className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sinal</p>
              <p className="text-sm font-medium">NFC + BLE</p>
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