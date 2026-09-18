import { db } from "@/db";
import { trades } from "@/db/schema";
import { desc } from "drizzle-orm";
import { TradeCard } from "@/components/trade-card";
import { JournalFeed } from "@/components/journal-feed";

// Force dynamic so we always fetch fresh data
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const allTrades = await db
    .select()
    .from(trades)
    .orderBy(desc(trades.closedAt));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 md:p-12">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Journal</h1>
          <p className="mt-2 text-[var(--muted)]">
            {allTrades.length} {allTrades.length === 1 ? "trade" : "trades"} on record
          </p>
        </div>

        {/* Feed */}
        {allTrades.length === 0 ? (
          <EmptyState />
        ) : (
          <JournalFeed trades={allTrades} />
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
      <p className="text-lg font-medium text-white">No trades yet</p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Your journal is empty. Log your first trade to get started.
      </p>
      <a
        href="/log-trade"
        className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
      >
        Log a trade
      </a>
    </div>
  );
}