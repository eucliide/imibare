import { TableSkeleton } from "@/components/skeleton";

export default function BreakdownLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <TableSkeleton key={i} rows={5} />
          ))}
          <div className="md:col-span-2">
            <TableSkeleton rows={7} />
          </div>
        </div>
      </div>
    </main>
  );
}
