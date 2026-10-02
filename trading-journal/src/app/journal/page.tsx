import { db } from "@/db";
import { trades, accounts, playbookSetups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { JournalFeed } from "@/components/journal-feed";
import { AccountSwitcher } from "@/components/account-switcher";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const accountParam = params.account;

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.createdAt);

  const activeAccounts = userAccounts.filter((a) => !a.isArchived);

  const whereClause = accountParam
    ? and(eq(trades.userId, user.id), eq(trades.accountId, accountParam), isNull(trades.deletedAt))
    : and(eq(trades.userId, user.id), isNull(trades.deletedAt));

  const rows = await db
    .select({
      trade: trades,
      setupName: playbookSetups.name,
    })
    .from(trades)
    .leftJoin(playbookSetups, eq(trades.setupId, playbookSetups.id))
    .where(whereClause)
    .orderBy(desc(trades.closedAt));

  const allTrades = rows.map((r) => ({ ...r.trade, setupName: r.setupName ?? null }));

  const allSetups = await db
    .select({ id: playbookSetups.id, name: playbookSetups.name })
    .from(playbookSetups)
    .where(eq(playbookSetups.userId, user.id))
    .orderBy(playbookSetups.name);

  const feedAccounts = activeAccounts.map((a) => ({ id: a.id, name: a.name }));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">Journal</h1>
            <p className="mt-2 text-[var(--muted)]">
              {allTrades.length} {allTrades.length === 1 ? "trade" : "trades"} on record
            </p>
          </div>
          <Link
            href="/log-trade"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
          >
            + Log trade
          </Link>
        </div>

        {activeAccounts.length > 0 && (
          <div className="mb-6">
            <AccountSwitcher accounts={activeAccounts} />
          </div>
        )}

        {allTrades.length === 0 ? (
          <EmptyState />
        ) : (
          <JournalFeed trades={allTrades} setups={allSetups} accounts={feedAccounts} />
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
