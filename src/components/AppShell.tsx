import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import Spotlight from "./Spotlight";
import { Search } from "lucide-react";
import { haptic } from "@/lib/haptics";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-32">{children}</main>

      {/* Floating Spotlight trigger — universal command */}
      <button
        type="button"
        aria-label="Abrir Spotlight"
        onClick={() => { haptic("soft"); setSpotlightOpen(true); }}
        className="fixed bottom-28 right-5 z-30 group"
      >
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-glow" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-active:scale-95">
          <Search className="h-5 w-5" strokeWidth={2} />
        </span>
      </button>

      <Spotlight open={spotlightOpen} onOpenChange={setSpotlightOpen} />
      <BottomNav />
    </div>
  );
};

export default AppShell;