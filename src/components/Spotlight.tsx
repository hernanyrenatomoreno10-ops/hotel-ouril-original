import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  KeyRound,
  Sparkles,
  Compass,
  Receipt,
  Sun,
  Wine,
  Waves,
  BedDouble,
  Coffee,
  ShieldCheck,
  Search,
} from "lucide-react";
import { haptic } from "@/lib/haptics";

type SpotlightProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const Spotlight = ({ open, onOpenChange }: SpotlightProps) => {
  const navigate = useNavigate();

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    haptic("soft");
    onOpenChange(false);
    // microtask so the dialog closes before navigation paints
    setTimeout(fn, 60);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="bg-transparent">
        <CommandInput
          placeholder="Pesquisar ou pedir ao Soul…"
          className="text-base"
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>Nada encontrado. Tente "toalhas" ou "Morna".</CommandEmpty>

          <CommandGroup heading="Ações rápidas">
            <CommandItem onSelect={() => run(() => navigate("/key"))}>
              <KeyRound className="mr-2 h-4 w-4 text-primary" /> Abrir porta · Suite 412
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/concierge"))}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" /> Falar com o Soul
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/checkout"))}>
              <Receipt className="mr-2 h-4 w-4 text-primary" /> Pedir a fatura
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="No quarto">
            <CommandItem onSelect={() => run(() => navigate("/room"))}>
              <BedDouble className="mr-2 h-4 w-4" /> Não incomodar
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/room"))}>
              <Sun className="mr-2 h-4 w-4" /> Cena "Pôr-do-sol"
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/room"))}>
              <Coffee className="mr-2 h-4 w-4" /> Pequeno-almoço no quarto
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/room"))}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Cofre · estado
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Mindelo esta noite">
            <CommandItem onSelect={() => run(() => navigate("/experiences"))}>
              <Wine className="mr-2 h-4 w-4" /> Morna ao vivo · Café Musique
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/experiences"))}>
              <Waves className="mr-2 h-4 w-4" /> Veleiro privado · Marina
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate("/experiences"))}>
              <Compass className="mr-2 h-4 w-4" /> Travessia para Santo Antão
            </CommandItem>
          </CommandGroup>
        </CommandList>

        <div className="px-3 py-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Search className="h-3 w-3" /> Spotlight
          </span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">K</kbd> para abrir
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
};

export default Spotlight;