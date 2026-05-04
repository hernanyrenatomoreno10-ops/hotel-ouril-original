import { NavLink } from "react-router-dom";
import { Home, KeyRound, Sparkles, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Stay", icon: Home },
  { to: "/key", label: "Key", icon: KeyRound },
  { to: "/concierge", label: "Soul", icon: Sparkles },
  { to: "/experiences", label: "Explore", icon: Compass },
  { to: "/checkout", label: "Account", icon: User },
];

export const BottomNav = () => {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-4 pb-4">
        <div className="glass-deep shadow-elevated rounded-full px-2 py-2 flex items-center justify-between">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 text-[10px] font-medium tracking-wide transition-all duration-300",
                  isActive
                    ? "text-primary-foreground bg-gradient-primary shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;