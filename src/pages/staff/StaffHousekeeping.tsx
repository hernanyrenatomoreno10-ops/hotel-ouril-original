import { useEffect, useState } from "react";
import StaffShell from "@/components/staff/StaffShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { Clock, CheckCircle2, ConciergeBell } from "lucide-react";

type Req = { id: string; service_type: string; description: string | null; price: number;
  status: string; created_at: string; room_number: string | null };

const elapsed = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "agora" : `${m} min`;
};

const StaffHousekeeping = () => {
  const [reqs, setReqs] = useState<Req[]>([]);
  const load = async () => {
    const { data } = await supabase.from("service_requests").select("*")
      .neq("status", "delivered").order("created_at", { ascending: true });
    setReqs((data ?? []) as Req[]);
  };
  useEffect(() => {
    load();
    const ch = supabase.channel("staff-svc")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const complete = async (r: Req) => {
    haptic("success");
    const { error } = await supabase.from("service_requests")
      .update({ status: "delivered", updated_at: new Date().toISOString() }).eq("id", r.id);
    if (error) toast.error("Sem permissão."); else toast.success(`Suite ${r.room_number ?? "—"} concluído`);
  };

  return (
    <StaffShell title="Governação · Express">
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Pedidos abertos</h2>
          <span className="text-xs text-muted-foreground">{reqs.length} a entregar</span>
        </div>
        <div className="space-y-3">
          {reqs.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">Tudo entregue. ✨</p>}
          {reqs.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card/60 border border-border/40 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center text-primary">
                  <ConciergeBell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.description || r.service_type}</p>
                  <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    Suite {r.room_number ?? "—"} · <Clock className="h-3 w-3" /> {elapsed(r.created_at)}
                    {r.price > 0 && <> · €{Number(r.price).toFixed(2)}</>}
                  </p>
                </div>
              </div>
              <button onClick={() => complete(r)}
                className="rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-xs font-medium shadow-glow flex items-center gap-1.5 active:scale-95">
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
              </button>
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
};

export default StaffHousekeeping;