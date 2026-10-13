import { TradeCardSkeleton } from "@/components/skeleton";

export default function CertificatesLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-9 w-44 animate-pulse rounded-lg bg-white/[0.04]" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded-md bg-white/[0.04]" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl bg-white/[0.04]" />
        </div>
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <TradeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
