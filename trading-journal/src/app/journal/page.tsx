import { db } from "@/db";
import { trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { JournalFeed } from "@/components/journal-feed";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const allTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.userId, user.id))
    .orderBy(desc(trades.closedAt));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Journal</h1>
          <p className="mt-2 text-[var(--muted)]">
            {allTrades.length} {allTrades.length === 1 ? "trade" : "trades"} on record
          </p>
        </div>

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
