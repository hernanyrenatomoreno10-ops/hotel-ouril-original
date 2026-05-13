import { useEffect, useState } from "react";
import StaffShell from "@/components/staff/StaffShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { Switch } from "@/components/ui/switch";
import { Clock, ChefHat, Bike, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Order = {
  id: string; item_name: string; price: number; status: string;
  created_at: string; room_number: string | null;
};
type Item = { id: string; name: string; category: string | null; available: boolean };

const STATUS_FLOW: Record<string, { next: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { next: "preparing", label: "Em Preparação", icon: ChefHat },
  preparing: { next: "out_for_delivery", label: "A Caminho", icon: Bike },
  out_for_delivery: { next: "delivered", label: "Entregue", icon: CheckCircle2 },
};

const elapsed = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "agora" : `${m} min`;
};

const StaffRestaurant = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const load = async () => {
    const { data: o } = await supabase.from("gastronomy_orders").select("*")
      .neq("status", "delivered").order("created_at", { ascending: true });
    setOrders((o ?? []) as Order[]);
    const { data: i } = await supabase.from("gastronomy_items").select("id,name,category,available").order("name");
    setItems((i ?? []) as Item[]);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("staff-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "gastronomy_orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "gastronomy_items" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const advance = async (o: Order) => {
    const flow = STATUS_FLOW[o.status]; if (!flow) return;
    haptic("tap");
    const { error } = await supabase.from("gastronomy_orders")
      .update({ status: flow.next, updated_at: new Date().toISOString() }).eq("id", o.id);
    if (error) toast.error("Não foi possível atualizar."); else toast.success(`#${o.room_number ?? "—"} → ${flow.label}`);
  };

  const toggleItem = async (i: Item) => {
    haptic("tap");
    const { error } = await supabase.from("gastronomy_items")
      .update({ available: !i.available, updated_at: new Date().toISOString() }).eq("id", i.id);
    if (error) toast.error("Sem permissão para alterar menu."); else toast.success(`${i.name} ${!i.available ? "ativo" : "desativado"}`);
  };

  return (
    <StaffShell title="Cozinha · Pedidos Activos">
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Pedidos em curso</h2>
            <span className="text-xs text-muted-foreground">{orders.length} activos</span>
          </div>
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Sem pedidos pendentes.</p>}
            {orders.map((o) => {
              const flow = STATUS_FLOW[o.status];
              const Icon = flow?.icon ?? CheckCircle2;
              return (
                <div key={o.id} className="rounded-2xl bg-card/60 border border-border/40 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-primary">
                      Suite {o.room_number ?? "—"} <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{elapsed(o.created_at)}</span>
                    </div>
                    <p className="font-medium truncate mt-0.5">{o.item_name}</p>
                    <p className="text-xs text-muted-foreground">€{Number(o.price).toFixed(2)} · estado: <span className="text-foreground">{o.status}</span></p>
                  </div>
                  {flow && (
                    <button onClick={() => advance(o)}
                      className="rounded-full bg-gradient-primary text-primary-foreground px-4 py-2 text-xs font-medium shadow-glow flex items-center gap-1.5 active:scale-95 transition">
                      <Icon className="h-3.5 w-3.5" /> {flow.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <h2 className="font-display text-xl mb-4">Menu · disponibilidade</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.id} className={cn("flex items-center justify-between rounded-xl px-3 py-2 border border-border/30",
                i.available ? "bg-card/40" : "bg-card/20 opacity-60")}>
                <div className="min-w-0">
                  <p className="text-sm truncate">{i.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.category ?? "—"}</p>
                </div>
                <Switch checked={i.available} onCheckedChange={() => toggleItem(i)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </StaffShell>
  );
};

export default StaffRestaurant;