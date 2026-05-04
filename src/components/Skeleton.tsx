import { cn } from "@/lib/utils";

/** Skeleton elegante com shimmer subtil — usado enquanto dados Supabase carregam. */
export const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-xl bg-muted/40",
      "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent",
      className
    )}
  />
);

export const ReservationSkeleton = () => (
  <div className="glass rounded-3xl p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Shimmer className="h-2.5 w-20" />
        <Shimmer className="h-5 w-44" />
        <Shimmer className="h-3 w-32" />
      </div>
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Shimmer className="h-12 rounded-2xl" />
      <Shimmer className="h-12 rounded-2xl" />
      <Shimmer className="h-12 rounded-2xl" />
    </div>
  </div>
);

export const ListItemSkeleton = () => (
  <div className="glass rounded-2xl p-4 flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <Shimmer className="h-4 w-40" />
      <Shimmer className="h-3 w-24" />
    </div>
    <Shimmer className="h-6 w-16 rounded-full" />
  </div>
);

export const AppointmentSkeleton = () => (
  <div className="glass p-5 rounded-3xl space-y-3">
    <Shimmer className="h-2.5 w-20" />
    <Shimmer className="h-5 w-36" />
    <div className="flex gap-3">
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-3 w-16" />
    </div>
  </div>
);