import { db } from "@/db";
import { trades, accounts, certificates, payouts, expenses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  calculateMetrics,
  buildCumulativeSeries,
  buildDailyPnlMap,
} from "@/lib/analytics";
import { buildEquitySeriesByDay, getAccountBalance } from "@/lib/accounts";
import { PnlCalendar } from "@/components/pnl-calendar";
import { DailyBarChart } from "@/components/daily-bar-chart";
import { MetricCard } from "@/components/metric-card";
import { EdgeRadar } from "@/components/edge-radar";
import { CumulativePnlChart } from "@/components/cumulative-pnl-chart";
import { AccountSwitcher } from "@/components/account-switcher";
import { AccountBalanceChart } from "@/components/account-balance-chart";
import { AnimatedNumber } from "@/components/animated-number";
import { formatPnl } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
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
    .select()
    .from(trades)
    .where(whereClause)
    .orderBy(desc(trades.closedAt));

  let startingBalance: number;
  if (accountParam) {
    const account = userAccounts.find((a) => a.id === accountParam);
    startingBalance = account ? parseFloat(account.startingBalance) : 0;
  } else {
    startingBalance = userAccounts.reduce(
      (sum, a) => sum + parseFloat(a.startingBalance),
      0
    );
  }

  const equitySeries = buildEquitySeriesByDay(startingBalance, allTrades);
  const currentBalance = getAccountBalance(startingBalance, allTrades);

  const metrics = calculateMetrics(allTrades);
  const cumulative = buildCumulativeSeries(allTrades);
  const dailyMap = buildDailyPnlMap(allTrades);

  const last30Days: { date: string; pnl: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    last30Days.push({ date: key, pnl: dailyMap[key] || 0 });
  }

  const today = new Date().toISOString().split("T")[0];
  const todayPnl = dailyMap[today] || 0;

  // Dashboard strip: this year's payouts + certificate count
  const yearStart = new Date(new Date().getUTCFullYear(), 0, 1);
  const [yearPayoutRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(cast(amount as numeric) - cast(fee as numeric)), 0) as float)` })
    .from(payouts)
    .where(and(eq(payouts.userId, user.id), sql`received_at >= ${yearStart}`))
    .limit(1);
  const [yearCertRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(certificates)
    .where(and(eq(certificates.userId, user.id), sql`achieved_at >= ${yearStart}`))
    .limit(1);
  const yearPayouts = Math.round((yearPayoutRow?.total ?? 0) * 100) / 100;
  const yearCerts = yearCertRow?.count ?? 0;

  // YTD expenses and real net profit for the dashboard strip
  const [yearExpenseRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(cast(amount as numeric)), 0) as float)` })
    .from(expenses)
    .where(and(eq(expenses.userId, user.id), sql`spent_at >= ${yearStart}`))
    .limit(1);
  const [totalPayoutRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(cast(amount as numeric) - cast(fee as numeric)), 0) as float)` })
    .from(payouts)
    .where(eq(payouts.userId, user.id))
    .limit(1);
  const [totalExpenseRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(cast(amount as numeric)), 0) as float)` })
    .from(expenses)
    .where(eq(expenses.userId, user.id))
    .limit(1);
  const ytdSpend = Math.round((yearExpenseRow?.total ?? 0) * 100) / 100;
  const realNetProfit = Math.round(((totalPayoutRow?.total ?? 0) - (totalExpenseRow?.total ?? 0)) * 100) / 100;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Dashboard</h1>
          <p className="mt-2 text-[var(--muted)]">
            {metrics.totalTrades} trades tracked · {todayPnl >= 0 ? "up" : "down"}{" "}
            {formatPnl(todayPnl)} today
          </p>
        </div>

        {/* Account switcher — sticky */}
        {activeAccounts.length > 0 && (
          <div className="sticky top-[60px] z-40 -mx-6 mb-6 bg-[var(--background)]/80 px-6 py-3 backdrop-blur-xl md:-mx-12 md:px-12">
            <AccountSwitcher accounts={activeAccounts} />
          </div>
        )}

        {userAccounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
            <p className="text-lg font-medium text-white">No accounts yet</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Create your first account to start tracking your equity.
            </p>
            <Link
              href="/accounts"
              className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
            >
              Create an account →
            </Link>
          </div>
        ) : (
          <>
            {/* Payout + cert strip */}
            {(yearPayouts > 0 || yearCerts > 0) && (
              <div className="mb-6 flex items-center gap-3 text-xs text-zinc-500">
                <span>This year:</span>
                {yearPayouts > 0 && (
                  <span>
                    <span className="font-medium text-emerald-400">
                      ${yearPayouts.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>{" "}
                    in payouts
                  </span>
                )}
                {yearPayouts > 0 && yearCerts > 0 && <span className="text-zinc-700">·</span>}
                {yearCerts > 0 && (
                  <span>
                    <span className="font-medium text-emerald-400">{yearCerts}</span>{" "}
                    {yearCerts === 1 ? "certificate" : "certificates"}
                  </span>
                )}
              </div>
            )}

            {/* YTD spend + real net strip */}
            {(ytdSpend > 0 || realNetProfit !== 0) && (
              <div className="mb-6 flex items-center gap-3 text-xs text-zinc-500">
                {ytdSpend > 0 && (
                  <span>
                    YTD spend:{" "}
                    <span className="font-medium text-rose-400">
                      ${ytdSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                )}
                {ytdSpend > 0 && <span className="text-zinc-700">·</span>}
                <span>
                  Real net:{" "}
                  <span className={realNetProfit >= 0 ? "font-medium text-emerald-400" : "font-medium text-rose-400"}>
                    {realNetProfit >= 0 ? "+" : "-"}$
                    {Math.abs(realNetProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
            )}

            {/* Hero: Account Balance Chart */}
            <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Account Balance
                </span>
                <span className="text-2xl font-semibold tracking-tighter text-white">
                  <AnimatedNumber value={currentBalance} prefix="$" decimals={2} />
                </span>
              </div>
              {equitySeries.length > 0 ? (
                <AccountBalanceChart
                  data={equitySeries}
                  startingBalance={startingBalance}
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-zinc-600">
                  No trades yet — log your first trade to see equity growth.
                </div>
              )}
            </div>

            {/* KPI row */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <MetricCard
                label="Net P&L"
                value={
                  <AnimatedNumber
                    value={Math.abs(metrics.netPnl)}
                    prefix={metrics.netPnl >= 0 ? "+$" : "-$"}
                    decimals={2}
                  />
                }
                accent={metrics.netPnl >= 0 ? "emerald" : "rose"}
                index={0}
              />
              <MetricCard
                label="Win Rate"
                value={<AnimatedNumber value={metrics.winRate} suffix="%" decimals={1} />}
                hint={`${metrics.wins}W · ${metrics.losses}L`}
                accent="zinc"
                index={1}
              />
              <MetricCard
                label="Profit Factor"
                value={
                  metrics.profitFactor >= 999 ? (
                    <span>∞</span>
                  ) : (
                    <AnimatedNumber value={metrics.profitFactor} decimals={2} />
                  )
                }
                accent={metrics.profitFactor >= 1.5 ? "emerald" : "zinc"}
                index={2}
              />
              <MetricCard
                label="Max Drawdown"
                value={
                  <AnimatedNumber value={metrics.maxDrawdown} prefix="$" decimals={0} />
                }
                accent="rose"
                index={3}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 md:col-span-1">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Edge Score
                  </span>
                  <span className="text-3xl font-bold tracking-tight text-emerald-400">
                    {metrics.edgeScore.toFixed(1)}
                  </span>
                </div>
                <EdgeRadar metrics={metrics} />
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 transition-all"
                    style={{ width: `${metrics.edgeScore}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 md:col-span-2">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Cumulative P&L
                  </span>
                  <span className="text-xs text-zinc-500">
                    {cumulative.length} data points
                  </span>
                </div>
                <CumulativePnlChart data={cumulative} />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <PnlCalendar dailyPnl={dailyMap} />
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Daily Net P&L
                  </span>
                  <span className="text-xs text-zinc-500">Last 30 days</span>
                </div>
                <DailyBarChart data={last30Days} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
