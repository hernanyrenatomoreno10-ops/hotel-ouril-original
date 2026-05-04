import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import Spotlight from "./Spotlight";
import InstallBanner from "./InstallBanner";
import { Search } from "lucide-react";
import { haptic } from "@/lib/haptics";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-32">{children}</main>

      {/* Language Selector & Spotlight */}
      <div className="fixed bottom-28 right-5 z-30 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => haptic("tap")}
          className="h-14 w-14 rounded-full glass border-primary/20 text-[10px] font-bold grid place-items-center hover:border-primary/40 transition-all shadow-elevated"
        >
          <span className="bg-gradient-primary bg-clip-text text-transparent">PT | EN</span>
        </button>

        <button
          type="button"
          aria-label="Abrir Spotlight"
          onClick={() => { haptic("soft"); setSpotlightOpen(true); }}
          className="group relative"
        >
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-glow" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-active:scale-95">
            <Search className="h-5 w-5" strokeWidth={2} />
          </span>
        </button>
      </div>

      <Spotlight open={spotlightOpen} onOpenChange={setSpotlightOpen} />
      <InstallBanner />
      <BottomNav />
    </div>
  );
};

export default AppShell;