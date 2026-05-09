import { useEffect, useMemo, useState } from "react";
import StaffShell from "@/components/staff/StaffShell";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Euro, Timer, KeyRound, TrendingUp } from "lucide-react";

type Order = { id: string; price: number; created_at: string; updated_at: string; status: string; room_number: string | null };
type Svc = { id: string; price: number; created_at: string; updated_at: string; status: string; room_number: string | null; description: string | null };
type Door = { id: string; created_at: string; room_number: string | null; method: string; status: string; user_id: string };

const StaffAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [svc, setSvc] = useState<Svc[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [{ data: o }, { data: s }, { data: d }] = await Promise.all([
        supabase.from("gastronomy_orders").select("*").gte("created_at", since),
        supabase.from("service_requests").select("*").gte("created_at", since),
        supabase.from("door_access_logs").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setOrders((o ?? []) as any);
      setSvc((s ?? []) as any);
      setDoors((d ?? []) as any);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const totalToday = useMemo(() => {
    const sum = (a: any[]) => a.filter((x) => x.created_at.startsWith(today)).reduce((s, x) => s + Number(x.price || 0), 0);
    return sum(orders) + sum(svc);
  }, [orders, svc, today]);
  const totalMonth = useMemo(() =>
    [...orders, ...svc].reduce((s, x) => s + Number(x.price || 0), 0), [orders, svc]);

  const avgResponseMin = useMemo(() => {
    const closed = [...orders, ...svc].filter((x: any) => x.status === "done" || x.status === "delivered");
    if (!closed.length) return 0;
    const total = closed.reduce((s: number, x: any) =>
      s + (new Date(x.updated_at).getTime() - new Date(x.created_at).getTime()), 0);
    return Math.round(total / closed.length / 60000);
  }, [orders, svc]);

  const dailySeries = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days[d] = 0;
    }
    [...orders, ...svc].forEach((x) => {
      const k = x.created_at.slice(0, 10);
      if (k in days) days[k] += Number(x.price || 0);
    });
    return Object.entries(days).map(([d, v]) => ({ day: d.slice(5), revenue: Math.round(v * 100) / 100 }));
  }, [orders, svc]);

  const categorySeries = useMemo(() => {
    const map: Record<string, number> = { Restaurante: 0, "Express": 0 };
    orders.forEach((o) => map.Restaurante += Number(o.price || 0));
    svc.forEach((s) => map.Express += Number(s.price || 0));
    return Object.entries(map).map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }));
  }, [orders, svc]);

  const fmt = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

  return (
    <StaffShell title="Business Intelligence">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Faturado hoje" value={fmt(totalToday)} icon={Euro} accent />
        <Kpi label="Faturado 30 dias" value={fmt(totalMonth)} icon={TrendingUp} />
        <Kpi label="Tempo médio resposta" value={`${avgResponseMin} min`} icon={Timer} />
        <Kpi label="Acessos (últimos)" value={String(doors.length)} icon={KeyRound} />
      </div>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-6">
        <div className="glass rounded-3xl p-5">
          <h3 className="font-display text-lg mb-3">Receita extra · 14 dias</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={dailySeries}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <h3 className="font-display text-lg mb-3">Por categoria</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={categorySeries}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg mb-3">Logs · Chave Digital</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="text-left py-2 pr-4">Data</th>
                <th className="text-left py-2 pr-4">Suite</th>
                <th className="text-left py-2 pr-4">Método</th>
                <th className="text-left py-2 pr-4">Estado</th>
                <th className="text-left py-2">User</th>
              </tr>
            </thead>
            <tbody>
              {doors.map((d) => (
                <tr key={d.id} className="border-b border-border/20 hover:bg-card/40">
                  <td className="py-2 pr-4 text-muted-foreground">{new Date(d.created_at).toLocaleString("pt-PT")}</td>
                  <td className="py-2 pr-4 font-medium">{d.room_number ?? "—"}</td>
                  <td className="py-2 pr-4 uppercase text-[10px] tracking-wider text-primary">{d.method}</td>
                  <td className="py-2 pr-4">
                    <span className={d.status === "success" ? "text-primary" : "text-destructive"}>{d.status}</span>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground truncate max-w-[160px]">{d.user_id.slice(0, 8)}…</td>
                </tr>
              ))}
              {doors.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Sem registos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </StaffShell>
  );
};

const Kpi = ({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) => (
  <div className={`glass rounded-2xl p-4 ${accent ? "ring-1 ring-primary/40 shadow-glow" : ""}`}>
    <div className="flex items-center justify-between">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <p className="font-display text-2xl mt-2">{value}</p>
  </div>
);

export default StaffAdmin;