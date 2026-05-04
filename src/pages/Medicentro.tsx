import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Stethoscope, Video, CalendarCheck, Clock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { AppointmentSkeleton } from "@/components/Skeleton";
import { FadeUp } from "@/components/Motion";

const Medicentro = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"book" | "history">("book");
  const [specialty, setSpecialty] = useState("Clínica Geral");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (activeTab === "history" && user) {
      fetchAppointments();
    }
  }, [activeTab, user]);

  const fetchAppointments = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('medical_appointments')
        .select('*')
        .order('appointment_date', { ascending: false });
        
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleBook = async () => {
    haptic("tap");
    setLoading(true);
    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      // Agendar para o dia seguinte as 10:00 (Mock para MVP)
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(10, 0, 0, 0);

      const { error } = await supabase.from('medical_appointments').insert([{
        user_id: userId,
        specialty,
        appointment_date: date.toISOString(),
        status: 'confirmed'
      }]);

      if (error) throw error;

      haptic("success");
      toast.success("Consulta confirmada com sucesso.");
      // Notificar o extracto da Account em tempo real
      window.dispatchEvent(new CustomEvent("mh:account-update"));
      setActiveTab("history");
    } catch (err: any) {
      toast.error(err.message || "Erro ao agendar.");
      haptic("soft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex bg-muted/40 p-1 rounded-full border border-border/40">
            <button
              onClick={() => { setActiveTab("book"); haptic("soft"); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${activeTab === "book" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Agendar
            </button>
            <button
              onClick={() => { setActiveTab("history"); haptic("soft"); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${activeTab === "history" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
            >
              Consultas
            </button>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-8 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Medicentro</p>
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Saúde & Bem-estar <br />
            <span className="text-muted-foreground">à distância de um toque.</span>
          </h1>
        </div>

        {activeTab === "book" ? (
          <div className="space-y-6 animate-fade-up">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold mb-4">Escolha a especialidade</h2>
              <div className="grid grid-cols-2 gap-3">
                {["Clínica Geral", "Fisioterapia", "Nutrição", "Psicologia"].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => { setSpecialty(spec); haptic("tap"); }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      specialty === spec 
                        ? "bg-gradient-primary border-transparent text-primary-foreground shadow-glow" 
                        : "glass border-border/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs font-medium">{spec}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border-primary/20 bg-primary/5">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 grid place-items-center shrink-0">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Telemedicina 24/7</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atendimento imediato via vídeo com a nossa equipa médica dedicada. Sem sair do conforto da sua suite.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full rounded-full bg-foreground text-background py-4 text-sm font-medium active:scale-[0.98] transition disabled:opacity-70"
            >
              {loading ? "A agendar..." : `Agendar ${specialty}`}
            </button>
          </div>
        ) : (
          <FadeUp className="space-y-4 pb-12">
            {loadingList ? (
              <>
                <AppointmentSkeleton />
                <AppointmentSkeleton />
              </>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 glass rounded-3xl">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Não tem consultas agendadas.</p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="glass p-5 rounded-3xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${apt.status === 'confirmed' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </p>
                      <h3 className="font-display text-lg font-semibold mt-1">{apt.specialty}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" /> {new Date(apt.appointment_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(apt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </FadeUp>
        )}
      </div>
    </AppShell>
  );
};

export default Medicentro;
