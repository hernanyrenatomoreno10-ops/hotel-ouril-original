import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-32">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppShell;