import { Component, type ErrorInfo, type ReactNode } from "react";
import { Cloud, RefreshCw } from "lucide-react";

const FRIENDLY_ERRORS = [
  "O Monte Cara está nublado por agora — a nossa equipa técnica está a restabelecer o sinal.",
  "Os ventos alísios sopraram forte sobre a ligação. Estamos a reorientar as velas.",
  "Uma onda atravessou-se no Porto Grande. Voltamos já à rota.",
];

interface State { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Mindelo Hub] Boundary caught:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const friendly = FRIENDLY_ERRORS[Math.floor(Math.random() * FRIENDLY_ERRORS.length)];
    return (
      <div className="min-h-screen bg-background grid place-items-center px-6">
        <div className="max-w-sm text-center space-y-5 animate-fade-up">
          <div className="mx-auto h-16 w-16 rounded-2xl glass-deep grid place-items-center">
            <Cloud className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Pequeno contratempo</p>
            <h1 className="font-display text-2xl font-semibold mt-2 leading-tight">{friendly}</h1>
            <p className="text-xs text-muted-foreground mt-3">
              Tente novamente dentro de momentos. A sua estadia continua intacta.
            </p>
          </div>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-5 py-3 text-sm font-medium shadow-glow active:scale-[0.98] transition"
          >
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;