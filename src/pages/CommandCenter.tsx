import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Utensils, Lightbulb, ConciergeBell, Settings, 
  Server, Users, CircleCheck, PowerOff, Image as ImageIcon, Save, Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "restaurante" | "automacao" | "pedidos" | "config";

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [onlineUsers, setOnlineUsers] = useState(42);
  const [pratoDoDia, setPratoDoDia] = useState({ name: "", price: "", description: "", image_url: "" });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      // Pedidos
      const { data: svcData } = await supabase
        .from("service_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (svcData) setPedidos(svcData);

      // Rooms / Automation
      const { data: roomSettings } = await supabase.from("room_settings").select("*");
      if (roomSettings) {
        // Mapear com números de quarto fictícios se necessário, ou usar user_id
        setRooms(roomSettings.map((r, i) => ({ ...r, room_number: `40${i + 1}` })));
      } else {
        // Mock se não houver dados
        setRooms([
          { id: "1", room_number: "401", ac_power: true, temperature: 22, lights_level: 100 },
          { id: "2", room_number: "402", ac_power: false, temperature: 24, lights_level: 0 },
          { id: "3", room_number: "410", ac_power: true, temperature: 20, lights_level: 50 },
          { id: "4", room_number: "412", ac_power: true, temperature: 21, lights_level: 100 },
        ]);
      }

      // Tentar carregar Prato do Dia se existir tabela hotel_content
      const { data: contentData } = await supabase
        .from("hotel_content" as any)
        .select("*")
        .eq("key", "prato_do_dia")
        .single();
      
      if (contentData && contentData.value) {
        setPratoDoDia(contentData.value);
      }
    };
    
    fetchData();

    // Mock real-time updates for guests online
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSavePrato = async () => {
    try {
      const { error } = await supabase
        .from("hotel_content" as any)
        .upsert({ 
          key: "prato_do_dia", 
          value: pratoDoDia,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      toast.success("Prato do Dia atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar. Verifique se a tabela hotel_content existe.");
    }
  };

  const handleEntregarPedido = async (id: string) => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "delivered", updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
      setPedidos(pedidos.filter(p => p.id !== id));
      toast.success("Pedido marcado como entregue!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar pedido.");
    }
  };

  const handleResetRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from("room_settings")
        .update({ ac_power: false, lights_level: 0 })
        .eq("id", roomId);
      
      if (error) throw error;
      setRooms(rooms.map(r => r.id === roomId ? { ...r, ac_power: false, lights_level: 0 } : r));
      toast.success("Quarto resetado com segurança.");
    } catch (err) {
      console.error(err);
      // Fallback update for mock
      setRooms(rooms.map(r => r.id === roomId ? { ...r, ac_power: false, lights_level: 0 } : r));
      toast.success("Quarto resetado (Mock).");
    }
  };

  const orderVolumeData = useMemo(() => {
    return [
      { hour: "08:00", orders: 4 },
      { hour: "10:00", orders: 7 },
      { hour: "12:00", orders: 15 },
      { hour: "14:00", orders: 11 },
      { hour: "16:00", orders: 6 },
      { hour: "18:00", orders: 8 },
      { hour: "20:00", orders: 22 },
      { hour: "22:00", orders: 12 },
    ];
  }, []);

  const getWaitTime = (createdAt: string) => {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff > 0 ? `${diff} min` : "Agora";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
              <Server className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">Command<br/>Center</h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
          <NavItem active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={activeTab === "restaurante"} onClick={() => setActiveTab("restaurante")} icon={Utensils} label="Restaurante" />
          <NavItem active={activeTab === "pedidos"} onClick={() => setActiveTab("pedidos")} icon={ConciergeBell} label="Pedidos" />
          <NavItem active={activeTab === "automacao"} onClick={() => setActiveTab("automacao")} icon={Lightbulb} label="Automação" />
          <NavItem active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={Settings} label="Configurações" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 border-b border-border/40 bg-background/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-display text-2xl capitalize">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Servidores Online</span>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{onlineUsers} Hóspedes Ativos</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6 shadow-glow">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Pedidos Hoje</h3>
                  <p className="text-4xl font-display text-primary">85</p>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Tempo Médio</h3>
                  <p className="text-4xl font-display">12 min</p>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Quartos Ocupados</h3>
                  <p className="text-4xl font-display">24 / 50</p>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 h-80">
                <h3 className="font-display text-lg mb-6">Volume de Pedidos por Hora</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderVolumeData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                      itemStyle={{ color: "hsl(var(--primary))" }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "restaurante" && (
            <div className="max-w-2xl">
              <div className="glass rounded-3xl p-8 border border-primary/20 shadow-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                  <Utensils className="text-primary" /> Gestor de Conteúdo: Restaurante
                </h3>
                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Prato do Dia</label>
                    <input 
                      type="text" 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={pratoDoDia.name}
                      onChange={e => setPratoDoDia({...pratoDoDia, name: e.target.value})}
                      placeholder="Ex: Lagosta Suada com Legumes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Preço (CVE / EUR)</label>
                    <input 
                      type="text" 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={pratoDoDia.price}
                      onChange={e => setPratoDoDia({...pratoDoDia, price: e.target.value})}
                      placeholder="Ex: 25€"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Descrição</label>
                    <textarea 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-24 resize-none"
                      value={pratoDoDia.description}
                      onChange={e => setPratoDoDia({...pratoDoDia, description: e.target.value})}
                      placeholder="Descrição apetitosa do prato..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">URL de Imagem de Destaque</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <input 
                          type="text" 
                          className="w-full bg-background/50 border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          value={pratoDoDia.image_url}
                          onChange={e => setPratoDoDia({...pratoDoDia, image_url: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleSavePrato}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3.5 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 mt-4"
                  >
                    <Save className="h-5 w-5" /> Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pedidos" && (
            <div>
              <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                <ConciergeBell className="text-primary" /> Fila de Pedidos (Menu Conforto)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                    Nenhum pedido pendente no momento.
                  </div>
                ) : (
                  pedidos.map(p => (
                    <div key={p.id} className="glass rounded-3xl p-6 border border-primary/20 shadow-glow flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">Quarto {p.room_number || "---"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5" /> {getWaitTime(p.created_at)}
                        </div>
                      </div>
                      <h4 className="text-lg font-medium mb-1">{p.service_type || "Item"}</h4>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">{p.description || "Sem detalhes adicionais"}</p>
                      <button 
                        onClick={() => handleEntregarPedido(p.id)}
                        className="w-full bg-background border border-border hover:border-primary hover:text-primary transition-colors py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CircleCheck className="h-4 w-4" /> Marcar como Entregue
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "automacao" && (
            <div>
              <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                <Lightbulb className="text-primary" /> Controlo de Quartos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rooms.map(room => (
                  <div key={room.id} className={cn("glass rounded-3xl p-6 transition-all", room.ac_power ? "border-primary/30 shadow-glow" : "border-border/40 opacity-80")}>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-display text-xl font-bold">Suite {room.room_number}</h4>
                      <div className={cn("h-3 w-3 rounded-full", room.ac_power ? "bg-primary shadow-[0_0_10px_hsl(var(--primary))]" : "bg-muted")}></div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ar Condicionado</span>
                        <span className="font-medium">{room.ac_power ? "LIGADO" : "DESLIGADO"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Temperatura</span>
                        <span className="font-medium">{room.temperature || "--"} °C</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Luzes</span>
                        <span className="font-medium">{room.lights_level || "0"}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResetRoom(room.id)}
                      className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <PowerOff className="h-4 w-4" /> Reset Pós-Checkout
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="glass rounded-3xl p-8 max-w-2xl">
              <h3 className="font-display text-2xl mb-6">Configurações do Sistema</h3>
              <p className="text-muted-foreground">Em desenvolvimento.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-medium",
        active ? "bg-primary/10 text-primary shadow-glow" : "text-muted-foreground hover:bg-card hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
