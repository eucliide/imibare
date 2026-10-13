import {
  MetricCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@/components/skeleton";

export default function ExpensesLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-6">
          <ChartSkeleton height={260} />
        </div>
        <div className="mt-6">
          <TableSkeleton rows={5} />
        </div>
      </div>
    </main>
  );
}
