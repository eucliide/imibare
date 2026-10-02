import { db } from "@/db";
import { trades, accounts, benchmarkPrices } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { buildEquitySeriesByDay } from "@/lib/accounts";
import { calculateMetrics } from "@/lib/analytics";
import {
  computeRiskMetrics,
  buildRollingMetrics,
  buildMonthlyReturns,
  normalizeBenchmark,
} from "@/lib/benchmark";
import { SP500_MONTHLY_CLOSES, SYMBOL_SP500 } from "@/lib/benchmark-seed";
import { AccountSwitcher } from "@/components/account-switcher";
import { PerformanceClient } from "./performance-client";

export const dynamic = "force-dynamic";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; benchmark?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const accountParam = params.account;
  const benchmarkParam = params.benchmark ?? "sp500";

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
    .orderBy(trades.closedAt);

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
  const metrics = calculateMetrics(allTrades);
  const riskMetrics = computeRiskMetrics(equitySeries, metrics.maxDrawdown);
  const rollingData = buildRollingMetrics(allTrades, 30);
  const monthlyReturns = buildMonthlyReturns(equitySeries, startingBalance);

  // Benchmark — try DB first, fall back to seed
  const dbPrices = await db
    .select({ date: benchmarkPrices.date, close: benchmarkPrices.close })
    .from(benchmarkPrices)
    .where(eq(benchmarkPrices.symbol, SYMBOL_SP500));

  const sp500Prices =
    dbPrices.length > 0
      ? dbPrices.map((p) => ({ date: p.date, close: parseFloat(p.close) }))
      : SP500_MONTHLY_CLOSES;

  let benchmarkKind: "flat" | "custom" | "index" = "index";
  let customPct = 20;
  if (benchmarkParam === "flat") benchmarkKind = "flat";
  else if (benchmarkParam.startsWith("custom:")) {
    benchmarkKind = "custom";
    customPct = parseFloat(benchmarkParam.split(":")[1]) || 20;
  }

  const benchmarkSeries = normalizeBenchmark(benchmarkKind, startingBalance, equitySeries, {
    annualTargetPct: customPct,
    prices: sp500Prices,
  });

  const benchmarkLabel =
    benchmarkKind === "flat"
      ? "Flat (no growth)"
      : benchmarkKind === "custom"
      ? `${customPct}% annual target`
      : "S&P 500";

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Performance</h1>
          <p className="mt-2 text-[var(--muted)]">
            Risk-adjusted analytics and benchmark comparison
          </p>
        </div>

        {activeAccounts.length > 0 && (
          <div className="sticky top-[60px] z-40 -mx-6 mb-6 bg-[var(--background)]/80 px-6 py-3 backdrop-blur-xl md:-mx-12 md:px-12">
            <AccountSwitcher accounts={activeAccounts} />
          </div>
        )}

        <PerformanceClient
          equitySeries={equitySeries}
          benchmarkSeries={benchmarkSeries}
          benchmarkLabel={benchmarkLabel}
          benchmarkParam={benchmarkParam}
          riskMetrics={riskMetrics}
          rollingData={rollingData}
          monthlyReturns={monthlyReturns}
          startingBalance={startingBalance}
          metrics={metrics}
        />
      </div>
    </main>
  );
}
