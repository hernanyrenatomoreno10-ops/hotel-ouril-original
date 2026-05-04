import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "mh:install-dismissed-at";
const DISMISS_TTL = 1000 * 60 * 60 * 24 * 7; // 7 dias

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    // iOS
    // @ts-expect-error vendor flag
    window.navigator.standalone === true);

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  // exclui contexto in-app já instalado
  !isStandalone();

export const InstallBanner = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Atraso para não interromper o primeiro impacto visual
      setTimeout(() => setVisible(true), 2500);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIOS()) {
      setShowIOS(true);
      setTimeout(() => setVisible(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    haptic("tap");
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    haptic("soft");
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") haptic("success");
    setDeferred(null);
    setVisible(false);
  };

  if (!visible || (!deferred && !showIOS)) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar Mindelo Hub"
      className={cn(
        "fixed left-4 right-4 bottom-44 z-40 mx-auto max-w-md",
        "glass border border-primary/25 rounded-2xl p-4 shadow-elevated",
        "animate-fade-up"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Instalar Mindelo Hub</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {showIOS
              ? "Toque em Partilhar e depois em \u201CAdicionar ao ecrã principal\u201D."
              : "Acesso rápido à Chave Digital, mesmo offline."}
          </p>
          {!showIOS && (
            <button
              onClick={install}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-xs font-medium h-9 px-4 active:scale-95 transition-transform"
            >
              <Download className="h-3.5 w-3.5" />
              Instalar app
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Fechar"
          className="h-8 w-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;