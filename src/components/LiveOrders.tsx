import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ConciergeBell, CheckCircle2, Loader2, Clock } from "lucide-react";

type Req = {
  id: string;
  service_type: string;
  description: string | null;
  status: string;
  price: number;
  created_at: string;
};

const fmt = (n: number) =>
  Number(n).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

const statusMeta = (s: string) => {
  switch (s) {
    case "delivered":
      return { icon: CheckCircle2, label: "Entregue", tone: "text-green-500" };
    case "in_progress":
      return { icon: Loader2, label: "A caminho", tone: "text-primary animate-spin" };
    default:
      return { icon: Clock, label: "Recebido", tone: "text-muted-foreground" };
  }
};

export const LiveOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Req[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const load = async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const { data } = await supabase
        .from("service_requests")
        .select("id,service_type,description,status,price,created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (mounted && data) setOrders(data as Req[]);
    };
    load();

    const channel = supabase
      .channel("svc-live-" + user.id)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") return [payload.new as Req, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((o) => (o.id === (payload.new as Req).id ? (payload.new as Req) : o));
            if (payload.eventType === "DELETE")
              return prev.filter((o) => o.id !== (payload.old as Req).id);
            return prev;
          });
          window.dispatchEvent(new CustomEvent("mh:account-update"));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!orders.length) return null;

  const total = orders.reduce((a, o) => a + Number(o.price || 0), 0);

  return (
    <section className="px-6 mt-7">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Em curso · ao vivo</p>
          <h2 className="font-display text-lg font-semibold mt-0.5 flex items-center gap-2">
            <ConciergeBell className="h-4 w-4 text-primary" /> Pedidos da Suite
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impacto na conta</p>
          <p className="font-display text-base font-semibold bg-gradient-primary bg-clip-text text-transparent tabular-nums">
            {fmt(total)}
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl p-2 divide-y divide-border/40">
        <AnimatePresence initial={false}>
          {orders.slice(0, 6).map((o) => {
            const meta = statusMeta(o.status);
            const Icon = meta.icon;
            return (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between px-3 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-muted grid place-items-center shrink-0">
                    <Icon className={`h-4 w-4 ${meta.tone}`} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.description ?? o.service_type}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {meta.label} · {new Date(o.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium tabular-nums shrink-0 ml-2">
                  {Number(o.price) > 0 ? fmt(Number(o.price)) : "Cortesia"}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LiveOrders;