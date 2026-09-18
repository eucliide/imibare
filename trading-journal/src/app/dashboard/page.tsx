import { db } from "@/db";
import { trades } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  calculateMetrics,
  buildCumulativeSeries,
  buildDailyPnlMap,
} from "@/lib/analytics";
import { MetricCard } from "@/components/metric-card";
import { EdgeRadar } from "@/components/edge-radar";
import { CumulativePnlChart } from "@/components/cumulative-pnl-chart";
import { formatPnl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const allTrades = await db.select().from(trades).orderBy(desc(trades.closedAt));

  const metrics = calculateMetrics(allTrades);
  const cumulative = buildCumulativeSeries(allTrades);
  const dailyMap = buildDailyPnlMap(allTrades);

  // Simple date lookup for today's pnl
  const today = new Date().toISOString().split("T")[0];
  const todayPnl = dailyMap[today] || 0;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Dashboard</h1>
          <p className="mt-2 text-[var(--muted)]">
            {metrics.totalTrades} trades tracked · {todayPnl >= 0 ? "up" : "down"}{" "}
            {formatPnl(todayPnl)} today
          </p>
        </div>

        {/* KPI Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="Net P&L"
            value={formatPnl(metrics.netPnl)}
            accent={metrics.netPnl >= 0 ? "emerald" : "red"}
            index={0}
          />
          <MetricCard
            label="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            hint={`${metrics.wins}W · ${metrics.losses}L`}
            index={1}
          />
          <MetricCard
            label="Profit Factor"
            value={metrics.profitFactor >= 999 ? "∞" : metrics.profitFactor.toFixed(2)}
            accent={metrics.profitFactor >= 1.5 ? "emerald" : "zinc"}
            index={2}
          />
          <MetricCard
            label="Max Drawdown"
            value={`-$${metrics.maxDrawdown.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}`}
            accent="red"
            index={3}
          />
        </div>

        {/* Edge Score + Cumulative P&L */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Edge Score Card */}
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

          {/* Cumulative P&L */}
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
      </div>
    </main>
  );
}