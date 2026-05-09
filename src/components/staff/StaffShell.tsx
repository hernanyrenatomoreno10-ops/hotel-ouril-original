import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Utensils, Sparkles, BarChart3, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/staff/restaurant", label: "Restaurante", icon: Utensils, role: "restaurant" as const },
  { to: "/staff/housekeeping", label: "Governação", icon: Sparkles, role: "housekeeping" as const },
  { to: "/staff/admin", label: "Admin", icon: BarChart3, role: "admin" as const },
];

const StaffShell = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const { roles, hasRole, signOut, user } = useAuth();
  const nav = useNavigate();
  const visible = tabs.filter((t) => hasRole(t.role) || hasRole("admin"));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Ouril · Back-office</p>
              <p className="font-display text-lg font-semibold">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-muted-foreground">{user?.email}</span>
            <button onClick={async () => { await signOut(); nav("/login"); }}
              className="glass rounded-full h-9 px-3 text-xs flex items-center gap-1.5 hover:bg-primary/10">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition",
                isActive ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </NavLink>
          ))}
          {visible.length === 0 && (
            <span className="text-xs text-muted-foreground">Sem permissões de back-office.</span>
          )}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default StaffShell;