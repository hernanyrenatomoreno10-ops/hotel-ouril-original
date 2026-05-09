import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "restaurant" | "housekeeping" | "guest";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  hasRole: (r: AppRole) => boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  hasRole: () => false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const loadRoles = (uid: string | undefined) => {
      if (!uid) { setRoles([]); return; }
      // defer to avoid deadlock
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
        setRoles((data ?? []).map((r: any) => r.role as AppRole));
      }, 0);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadRoles(session?.user?.id);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadRoles(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setUser(null);
    setRoles([]);
    await supabase.auth.signOut();
  };

  const hasRole = (r: AppRole) => roles.includes(r);

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, hasRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
