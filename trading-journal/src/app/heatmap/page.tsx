import { db } from "@/db";
import { trades, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { buildHeatmap } from "@/lib/heatmap";
import { groupBySession } from "@/lib/breakdown";
import { SessionHeatmap } from "@/components/session-heatmap";
import { BreakdownTable } from "@/components/breakdown-table";
import { AccountSwitcher } from "@/components/account-switcher";

export const dynamic = "force-dynamic";

export default async function HeatmapPage({
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

  const allTrades = await db
    .select({
      netPnl: trades.netPnl,
      closedAt: trades.closedAt,
      outcome: trades.outcome,
      symbol: trades.symbol,
      direction: trades.direction,
      strategy: trades.strategy,
      notes: trades.notes,
      openedAt: trades.openedAt,
      id: trades.id,
    })
    .from(trades)
    .where(whereClause);

  const grid = buildHeatmap(allTrades);
  const sessionRows = groupBySession(allTrades);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            Session Heatmap
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Where your edge actually lives.
          </p>
        </div>

        {activeAccounts.length > 0 && (
          <div className="mb-6">
            <AccountSwitcher accounts={activeAccounts} />
          </div>
        )}

        {allTrades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
            <p className="text-lg font-medium text-white">No trades yet</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Log some trades and your edge map will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            {/* Heatmap card */}
            <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
              <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Day × Session
              </div>
              <SessionHeatmap grid={grid} />
            </div>

            {/* By Session breakdown */}
            <BreakdownTable title="By Session" rows={sessionRows} index={0} />
          </div>
        )}
      </div>
    </main>
  );
}
