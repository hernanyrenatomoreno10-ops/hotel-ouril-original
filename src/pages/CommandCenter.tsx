import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Utensils, Lightbulb, ConciergeBell, Settings, 
  Server, Users, CircleCheck, PowerOff, Image as ImageIcon, Save, Clock,
  Plus, Trash2, Edit2, X, ChevronRight, History, AlertTriangle
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
  const [gastronomyItems, setGastronomyItems] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [filterHotelId, setFilterHotelId] = useState<string>("all");
  const { hotels } = useHotel();
  
  // CMS Form States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: "", price_eur: 0, description: "", category: "Destaques", image_url: "" });

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      // Pedidos
      const { data: svcData } = await supabase
        .from("service_requests")
        .select("*, hotels(name)")
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

      // Gastronomy Items
      const { data: gastroData } = await supabase.from("gastronomy_items").select("*").order("created_at", { ascending: false });
      if (gastroData) setGastronomyItems(gastroData);

      // Experiences / Events
      const { data: expData } = await supabase.from("experiences").select("*").order("created_at", { ascending: false });
      if (expData) setExperiences(expData);

      // Tentar carregar Prato do Dia se existir tabela hotel_content
      const { data: contentData } = await supabase
        .from("hotel_content" as any)
        .select("*")
        .eq("key", "prato_do_dia")
        .maybeSingle();
      
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
        .update({ ac_power: false, lights_level: 0, temperature: 24 })
        .eq("id", roomId);
      
      if (error) throw error;
      setRooms(rooms.map(r => r.id === roomId ? { ...r, ac_power: false, lights_level: 0, temperature: 24 } : r));
      toast.success("Quarto resetado com segurança.");
    } catch (err) {
      console.error(err);
      setRooms(rooms.map(r => r.id === roomId ? { ...r, ac_power: false, lights_level: 0, temperature: 24 } : r));
      toast.success("Quarto resetado (Mock).");
    }
  };

  const handleToggleRoomAC = async (roomId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setRooms(rooms.map(r => r.id === roomId ? { ...r, ac_power: newStatus } : r));
    try {
      const { error } = await supabase.from("room_settings").update({ ac_power: newStatus }).eq("id", roomId);
      if (error) throw error;
      toast.info(`AC da Suite ${rooms.find(r => r.id === roomId)?.room_number} ${newStatus ? "Ligado" : "Desligado"}`);
    } catch (err) {
      console.warn("Update mock only");
    }
  };

  const handleUpdateItem = async () => {
    if (!newItem.name || !newItem.price_eur) {
      toast.error("Nome e preço são obrigatórios.");
      return;
    }

    try {
      if (editingItem) {
        const { error } = await supabase.from("gastronomy_items").update(newItem).eq("id", editingItem.id);
        if (error) throw error;
        setGastronomyItems(gastronomyItems.map(i => i.id === editingItem.id ? { ...i, ...newItem } : i));
        toast.success("Item atualizado!");
      } else {
        const { data, error } = await supabase.from("gastronomy_items").insert([newItem]).select();
        if (error) throw error;
        if (data) setGastronomyItems([data[0], ...gastronomyItems]);
        toast.success("Novo item criado!");
      }
      setNewItem({ name: "", price_eur: 0, description: "", category: "Destaques", image_url: "" });
      setEditingItem(null);
    } catch (err) {
      toast.error("Erro ao salvar item.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("gastronomy_items").delete().eq("id", id);
      if (error) throw error;
      setGastronomyItems(gastronomyItems.filter(i => i.id !== id));
      toast.success("Item removido.");
    } catch (err) {
      toast.error("Erro ao remover.");
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
            
            {/* Multi-Hotel Filter */}
            <select 
              className="bg-card border border-border/40 rounded-full px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={filterHotelId}
              onChange={(e) => setFilterHotelId(e.target.value)}
            >
              <option value="all">TODOS OS HOTÉIS</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>
              ))}
            </select>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass rounded-3xl p-6 border border-primary/20 shadow-glow relative overflow-hidden">
                  <h3 className="font-display text-xl mb-6 flex items-center gap-2">
                    {editingItem ? <Edit2 className="text-primary h-5 w-5" /> : <Plus className="text-primary h-5 w-5" />}
                    {editingItem ? "Editar Item" : "Novo Item"}
                  </h3>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Nome do Prato"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm"
                        value={newItem.price_eur}
                        onChange={e => setNewItem({...newItem, price_eur: Number(e.target.value)})}
                        placeholder="Preço (€)"
                      />
                      <select 
                        className="bg-background/50 border border-border rounded-xl px-3 py-2.5 text-xs"
                        value={newItem.category || ""}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                      >
                        <option value="Destaques">Destaques</option>
                        <option value="Entradas">Entradas</option>
                        <option value="Peixe">Peixe</option>
                        <option value="Carne">Carne</option>
                        <option value="Sobremesas">Sobremesas</option>
                      </select>
                    </div>
                    <textarea 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm h-20 resize-none"
                      value={newItem.description || ""}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Descrição..."
                    />
                    <input 
                      type="text" 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm"
                      value={newItem.image_url || ""}
                      onChange={e => setNewItem({...newItem, image_url: e.target.value})}
                      placeholder="URL da Imagem"
                    />
                    <div className="flex gap-2 pt-2">
                      {editingItem && (
                        <button 
                          onClick={() => { setEditingItem(null); setNewItem({ name: "", price_eur: 0, description: "", category: "Destaques", image_url: "" }); }}
                          className="flex-1 bg-muted text-foreground py-2.5 rounded-xl text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                      <button 
                        onClick={handleUpdateItem}
                        className="flex-[2] bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium shadow-glow flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" /> {editingItem ? "Atualizar" : "Criar Item"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-3xl p-6">
                  <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Prato do Dia
                  </h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-xs"
                      value={pratoDoDia.name}
                      onChange={e => setPratoDoDia({...pratoDoDia, name: e.target.value})}
                      placeholder="Nome do Prato"
                    />
                    <button onClick={handleSavePrato} className="w-full bg-primary/20 text-primary py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                      Atualizar Destaque
                    </button>
                  </div>
                </div>
              </div>

              {/* List Side */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-display text-xl">Cardápio Atual</h3>
                  <span className="text-xs text-muted-foreground">{gastronomyItems.length} itens</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gastronomyItems.map(item => (
                    <div key={item.id} className="glass rounded-2xl p-4 flex gap-4 group">
                      <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-border/40">
                        <img src={item.image_url || "/placeholder.svg"} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <span className="text-primary font-bold text-xs">€{item.price_eur}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingItem(item); setNewItem(item); }}
                            className="p-1.5 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="pt-6 border-t border-border/40">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <h3 className="font-display text-xl">Eventos & Experiências</h3>
                    <span className="text-xs text-muted-foreground">{experiences.length} eventos</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="glass rounded-2xl p-4 flex gap-4 group border-primary/10">
                        <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0">
                          <img src={exp.image_url || "/placeholder.svg"} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm truncate">{exp.title}</h4>
                            <span className="text-xs font-bold text-primary">{exp.tag}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{exp.place}</p>
                          <div className="flex gap-2 mt-3">
                            <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">EDITAR</button>
                            <button className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors">REMOVER</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pedidos" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl flex items-center gap-2">
                  <ConciergeBell className="text-primary" /> Fila de Pedidos
                </h3>
                {pedidos.filter(p => p.service_type === "SOS").length > 0 && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/40 px-4 py-2 rounded-full animate-pulse">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-black text-destructive uppercase tracking-wider">
                      {pedidos.filter(p => p.service_type === "SOS").length} Alerta{pedidos.filter(p => p.service_type === "SOS").length > 1 ? "s" : ""} SOS
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                    Nenhum pedido pendente no momento.
                  </div>
                ) : (
                  [...pedidos]
                    .filter(p => filterHotelId === "all" || p.hotel_id === filterHotelId)
                    // SOS first, then by created_at
                    .sort((a, b) => {
                      if (a.service_type === "SOS" && b.service_type !== "SOS") return -1;
                      if (b.service_type === "SOS" && a.service_type !== "SOS") return 1;
                      return 0;
                    })
                    .map(p => {
                      const isSOS = p.service_type === "SOS";
                      return (
                      <div key={p.id} 
                        onClick={() => { setSelectedOrder(p); setIsOrderModalOpen(true); }}
                        className={cn(
                          "rounded-3xl p-6 flex flex-col h-full relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all group",
                          isSOS
                            ? "bg-destructive/10 border-2 border-destructive/60 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-pulse-slow"
                            : "glass border border-primary/20 shadow-glow"
                        )}
                      >
                        {/* Left accent bar */}
                        <div className={cn("absolute top-0 left-0 w-1.5 h-full rounded-l-3xl", isSOS ? "bg-destructive" : "bg-primary")} />

                        {/* SOS Badge */}
                        {isSOS && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> EMERGÊNCIA
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                              isSOS ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                            )}>Quarto {p.room_number || "---"}</span>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">{(p.hotels as any)?.name || "Ouril Hotels"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5" /> {getWaitTime(p.created_at)}
                          </div>
                        </div>
                      <h4 className="text-lg font-medium mb-1">{p.service_type || "Item"}</h4>
                      <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{p.description || "Sem detalhes adicionais"}</p>
                      <div className="w-full flex items-center justify-between text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ver detalhes</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                   );
                    })
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
                      <button 
                        onClick={() => handleToggleRoomAC(room.id, room.ac_power)}
                        className={cn("h-10 w-10 rounded-full grid place-items-center transition-all", room.ac_power ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground")}
                      >
                        <Lightbulb className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ar Condicionado</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", room.ac_power ? "bg-green-500" : "bg-red-500")} />
                          <span className="font-medium">{room.ac_power ? "Ativo" : "Off"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Temperatura</span>
                        <span className="font-medium tabular-nums">{room.temperature || "22"}°C</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Luzes</span>
                          <span className="font-medium tabular-nums">{room.lights_level || "100"}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${room.lights_level || 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResetRoom(room.id)}
                        className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        Reset
                      </button>
                    </div>
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

      {/* Order Detail Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOrderModalOpen(false)}></div>
          <div className="relative glass-deep w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-primary/20 animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">Detalhes do Pedido</span>
                  <h2 className="font-display text-3xl font-bold mt-3">Suite {selectedOrder.room_number || "---"}</h2>
                </div>
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  className="h-10 w-10 rounded-full glass border-border hover:bg-muted transition-colors grid place-items-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 grid place-items-center shrink-0">
                    <ConciergeBell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedOrder.service_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedOrder.description || "Nenhum detalhe adicional fornecido pelo hóspede."}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-3.5 w-3.5" /> Histórico do Pedido
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                    <HistoryItem time="Agora" status="Aguardando atendimento" active />
                    <HistoryItem time={getWaitTime(selectedOrder.created_at) + " atrás"} status="Pedido recebido pelo sistema" />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl glass border-border font-medium text-sm transition-all"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    handleEntregarPedido(selectedOrder.id);
                    setIsOrderModalOpen(false);
                  }}
                  className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-glow transition-all active:scale-[0.98]"
                >
                  Concluir e Entregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ time, status, active }: { time: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-center gap-4 pl-1 relative">
      <div className={cn("h-5 w-5 rounded-full border-2 border-background z-10 grid place-items-center", active ? "bg-primary" : "bg-muted")}>
        {active && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
      </div>
      <div className="flex-1">
        <p className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{status}</p>
        <p className="text-[10px] text-muted-foreground/60">{time}</p>
      </div>
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
