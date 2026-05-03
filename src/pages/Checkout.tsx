import { useState } from "react";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Check, ScanFace, FileText, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { haptic } from "@/lib/haptics";

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
                <div className="space-y-3">
                  {[
                    { l: "Suite Atlântica · 4 noites", v: "€1.240,00" },
                    { l: "Spa & Wellness", v: "€180,00" },
                    { l: "Restaurante Marina", v: "€96,50" },
                    { l: "Mini-bar", v: "€42,00" },
                  ].map((row) => (
                    <div key={row.l} className="flex justify-between text-sm py-2 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground">{row.l}</span>
                      <span className="font-medium">{row.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 mt-2 border-t border-border">
                    <span className="font-display font-semibold">Total</span>
                    <span className="font-display text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                      €1.558,50
                    </span>
                  </div>
                </div>
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
                    Será cobrado €1.558,50 após confirmação.
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