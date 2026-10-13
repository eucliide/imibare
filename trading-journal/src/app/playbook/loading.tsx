import { TradeCardSkeleton, TableSkeleton } from "@/components/skeleton";

export default function PlaybookLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-white/[0.04]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
        <TableSkeleton rows={4} />
        <div className="mt-6 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <TradeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
