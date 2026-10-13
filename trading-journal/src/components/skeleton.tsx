import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/[0.04]", className)}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5">
      <Skeleton className="h-2.5 w-[40%]" />
      <Skeleton className="mt-3 h-7 w-[60%]" />
      <Skeleton className="mt-2 h-2 w-[30%]" />
    </div>
  );
}

export function TradeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-8 w-[120px]" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-4 h-4 w-[70%]" />
        </div>
        <Skeleton className="hidden h-20 w-[120px] rounded-xl md:block" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)]">
      <div className="border-b border-white/[0.05] px-6 py-4">
        <Skeleton className="h-4 w-[140px]" />
      </div>
      <div className="divide-y divide-white/[0.03]">
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-2.5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-full" />
          ))}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-3"
          >
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="ml-auto h-4 w-8" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6"
      style={{ height: height + 48 }}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <Skeleton className="h-2.5 w-[120px]" />
        <Skeleton className="h-2.5 w-[60px]" />
      </div>
      <div
        className="w-full animate-pulse rounded-xl bg-white/[0.04]"
        style={{ height }}
      />
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6">
      <Skeleton className="mb-4 h-2.5 w-[100px]" />
      <div className="grid grid-cols-7 gap-1">
        {[...Array(42)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  );
}
