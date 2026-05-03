import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Bell, Calendar, Info, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "alert" | "booking";
  read: boolean;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Carregar do localStorage
    const saved = JSON.parse(localStorage.getItem('mindelo_notifications') || '[]');
    
    // Fallback/Seed inicial caso esteja vazio
    if (saved.length === 0) {
      const initial: Notification[] = [
        {
          id: "1",
          title: "Bem-vindo ao Mindelo",
          message: "A sua Suite Atlântica já está disponível. O check-in móvel foi concluído com sucesso.",
          time: "14:00",
          type: "info",
          read: true
        },
        {
          id: "2",
          title: "Reserva Confirmada",
          message: "A sua mesa no Restaurante Marina está confirmada para as 20:30.",
          time: "Ontem",
          type: "booking",
          read: true
        }
      ];
      setNotifications(initial);
      localStorage.setItem('mindelo_notifications', JSON.stringify(initial));
    } else {
      setNotifications(saved);
    }
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('mindelo_notifications', JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <ShieldAlert className="h-4 w-4 text-orange-500" />;
      case "booking": return <Calendar className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Inbox</p>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-6 mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              Avisos &<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Notificações</span>
            </h1>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllRead} className="text-xs text-primary font-medium border border-primary/30 px-3 py-1 rounded-full">
              Ler todas
            </button>
          )}
        </div>

        <div className="space-y-3 pb-12">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className={`p-4 rounded-3xl glass transition-all duration-300 ${!note.read ? 'border-primary/40 shadow-glow bg-primary/5' : 'border-border/40 opacity-80'}`}
            >
              <div className="flex gap-4">
                <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-full grid place-items-center ${!note.read ? 'bg-background' : 'bg-muted/50'}`}>
                  {getIcon(note.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm ${!note.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {note.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {note.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {note.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Sem novas notificações.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Notifications;
