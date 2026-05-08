import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Check, ScanFace, FileText, CreditCard, Stethoscope, Sparkles, Wine, Landmark, ConciergeBell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { FadeUp } from "@/components/Motion";
import { Shimmer } from "@/components/Skeleton";

const steps = [
  { icon: ScanFace, title: "Identidade", desc: "Validação biométrica segura" },
  { icon: FileText, title: "Fatura", desc: "Resumo da estadia" },
  { icon: CreditCard, title: "Pagamento", desc: "Cartão em arquivo" },
];

const Checkout = () => {
  const [step, setStep] = useState(0);
  const done = step >= steps.length;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Extracto vivo — Medicentro + Gastronomia + Experiências
  const [extras, setExtras] = useState<{ label: string; price: number; icon: typeof Stethoscope }[]>([]);
  const [booking, setBooking] = useState<any>(null);
  const [touristTax, setTouristTax] = useState<{ nights: number; perNight: number } | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const fetchExtras = async () => {
    setLoadingExtras(true);
    try {
      const [appts, gastro, exps, svc, bk] = await Promise.all([
        supabase.from("medical_appointments").select("specialty,status").eq("status", "confirmed"),
        supabase.from("gastronomy_orders").select("item_name,price"),
        supabase.from("experience_reservations").select("title,price_eur,status").eq("status", "confirmed"),
        supabase.from("service_requests").select("description,service_type,price").gt("price", 0),
        supabase.from("bookings").select("check_in_date,check_out_date,nightly_rate,hotels(tourist_tax_per_night,name)").limit(1).maybeSingle(),
      ]);

      const PRICE_BY_SPECIALTY: Record<string, number> = {
        "Clínica Geral": 65,
        "Fisioterapia": 80,
        "Nutrição": 70,
        "Psicologia": 90,
      };

      const list: { label: string; price: number; icon: typeof Stethoscope }[] = [];
      (appts.data || []).forEach((a: any) =>
        list.push({ label: `Medicentro · ${a.specialty}`, price: PRICE_BY_SPECIALTY[a.specialty] ?? 60, icon: Stethoscope })
      );
      (gastro.data || []).forEach((g: any) =>
        list.push({ label: `Gastronomia · ${g.item_name}`, price: Number(g.price) || 0, icon: Wine })
      );
      (exps.data || []).forEach((e: any) =>
        list.push({ label: `Experiência · ${e.title}`, price: Number(e.price_eur) || 45, icon: Sparkles })
      );
      (svc.data || []).forEach((s: any) =>
        list.push({ label: `Express · ${s.description ?? s.service_type}`, price: Number(s.price) || 0, icon: ConciergeBell })
      );
      setExtras(list);

      if (bk.data) {
        setBooking(bk.data);
        const inD = new Date((bk.data as any).check_in_date);
        const outD = new Date((bk.data as any).check_out_date);
        const nights = Math.max(1, Math.round((+outD - +inD) / 86400000));
        const perNight = Number((bk.data as any).hotels?.tourist_tax_per_night ?? 2.75);
        setTouristTax({ nights, perNight });
      }
    } catch (err) {
      console.warn("Extras indisponíveis:", err);
    } finally {
      setLoadingExtras(false);
    }
  };

  useEffect(() => {
    fetchExtras();
    const onUpdate = () => fetchExtras();
    window.addEventListener("mh:account-update", onUpdate);
    return () => window.removeEventListener("mh:account-update", onUpdate);
  }, []);

  const nights = touristTax?.nights ?? 4;
  const nightly = Number(booking?.nightly_rate) || 310;
  const baseRows = [
    { l: `${booking?.room_name ?? "Suite Atlântica"} · ${nights} noites`, v: nights * nightly },
  ];
  const taxTotal = touristTax ? touristTax.nights * touristTax.perNight : nights * 2.75;
  const extrasTotal = extras.reduce((acc, r) => acc + r.price, 0);
  const grandTotal = baseRows.reduce((a, r) => a + r.v, 0) + extrasTotal + taxTotal;
  const fmt = (n: number) =>
    n.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

  const userName = user?.email ? user.email.split('@')[0] : "Hóspede";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const handleNext = async () => {
    haptic("tap");
    if (step === 2) {
      // Finalize checkout
      await signOut();
      setStep(s => s + 1);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <AppShell>
      <div className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Voltar" className="glass h-10 w-10 rounded-full grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Smart Check-out</p>
          <div className="h-10 w-10" />
        </div>

        {!done ? (
          <>
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Passo {step + 1} de 3</p>
              <h1 className="font-display text-3xl font-semibold mt-2">{steps[step].title}</h1>
              <p className="text-sm text-muted-foreground mt-2">{steps[step].desc}</p>
            </div>

            {/* Progress */}
            <div className="flex gap-2 mt-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= step ? "bg-gradient-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step body */}
            <div className="mt-10 glass rounded-3xl p-6">
              {step === 0 && (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="relative h-32 w-32 grid place-items-center">
                    <span className="absolute inset-0 rounded-full border border-primary/30 animate-ripple" />
                    <div className="h-24 w-24 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
                      <ScanFace className="h-10 w-10 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground max-w-xs">
                    Olhe para a câmara para confirmar a sua identidade. Os dados são processados localmente.
                  </p>
                </div>
              )}

              {step === 1 && (
                <FadeUp className="space-y-3">
                  {baseRows.map((row) => (
                    <div key={row.l} className="flex justify-between text-sm py-2 border-b border-border/40">
                      <span className="text-muted-foreground">{row.l}</span>
                      <span className="font-medium">{fmt(row.v)}</span>
                    </div>
                  ))}

                  {/* Extras dinâmicos: Medicentro, Gastronomia, Experiências */}
                  {loadingExtras ? (
                    <div className="space-y-2 pt-1">
                      <Shimmer className="h-5 w-full" />
                      <Shimmer className="h-5 w-3/4" />
                    </div>
                  ) : extras.length > 0 ? (
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2">Adicionados durante a estadia</p>
                      {extras.map((row, i) => {
                        const Icon = row.icon;
                        return (
                          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/40">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                              {row.label}
                            </span>
                            <span className="font-medium tabular-nums">{fmt(row.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Taxa turística obrigatória do município de Mindelo */}
                  <div className="flex items-center justify-between text-sm py-2 border-b border-border/40">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Landmark className="h-3.5 w-3.5 text-primary" />
                      Taxa turística · {nights} × {fmt(touristTax?.perNight ?? 2.75)}
                    </span>
                    <span className="font-medium tabular-nums">{fmt(taxTotal)}</span>
                  </div>

                  <div className="flex justify-between pt-3 mt-2 border-t border-border">
                    <span className="font-display font-semibold">Total</span>
                    <span className="font-display text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent tabular-nums">
                      {fmt(grandTotal)}
                    </span>
                  </div>
                </FadeUp>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-card border border-primary/20 p-5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground tracking-wider uppercase">Visa</p>
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-display text-xl tracking-[0.3em] mt-6">•••• 4287</p>
                    <p className="text-xs text-muted-foreground mt-2">{displayName} · 12/27</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Será cobrado {fmt(grandTotal)} após confirmação.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="mt-6 w-full rounded-full bg-gradient-primary text-primary-foreground py-4 text-sm font-medium shadow-glow active:scale-[0.99] transition"
            >
              {step === 2 ? "Confirmar e fechar conta" : "Continuar"}
            </button>
          </>
        ) : (
          <div className="text-center mt-24 animate-fade-up">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
              <Check className="h-10 w-10 text-primary-foreground" strokeWidth={2.25} />
            </div>
            <h1 className="font-display text-3xl font-semibold mt-6">Até breve, {displayName}.</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              A sua fatura foi enviada por email. Mindelo aguarda o seu regresso.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-block mt-8 rounded-full glass px-6 py-3 text-sm hover:border-primary/40 transition"
            >
              Voltar ao início
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Checkout;