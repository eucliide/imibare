import { ChartSkeleton, TableSkeleton } from "@/components/skeleton";

export default function HeatmapLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <ChartSkeleton height={320} />
          <TableSkeleton rows={5} />
        </div>
      </div>
    </main>
  );
}
