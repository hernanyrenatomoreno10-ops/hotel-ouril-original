import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Utensils, Sparkles, BarChart3, ShieldCheck, Search } from "lucide-react";
import BottomNav from "./BottomNav";
import Spotlight from "./Spotlight";
import InstallBanner from "./InstallBanner";
import { haptic } from "@/lib/haptics";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-32">{children}</main>

      {/* Staff Quick Access (Dev Mode) */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        <Link to="/staff/restaurant" className="h-10 w-10 rounded-full glass border-primary/20 grid place-items-center hover:bg-primary/10 transition-all shadow-glow group" title="Restaurante">
          <Utensils className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        </Link>
        <Link to="/staff/housekeeping" className="h-10 w-10 rounded-full glass border-primary/20 grid place-items-center hover:bg-primary/10 transition-all shadow-glow group" title="Governação">
          <Sparkles className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        </Link>
        <Link to="/staff/admin" className="h-10 w-10 rounded-full glass border-primary/20 grid place-items-center hover:bg-primary/10 transition-all shadow-glow group" title="Admin Staff">
          <BarChart3 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        </Link>
        <Link to="/admin" className="h-10 w-10 rounded-full glass border-primary/20 grid place-items-center hover:bg-primary/10 transition-all shadow-glow group" title="Command Center">
          <ShieldCheck className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
        </Link>
      </div>

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