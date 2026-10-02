"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";
import type { RiskMetrics, RollingPoint, MonthlyReturns } from "@/lib/benchmark";
import type { TradingMetrics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type EquityPoint = { date: string; equity: number };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function yFmt(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function pctColor(v: number | null) {
  if (v === null) return "text-zinc-700";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-zinc-400";
}

function pctBg(v: number | null) {
  if (v === null) return "";
  const intensity = Math.min(Math.abs(v) / 10, 1);
  if (v > 0) return `rgba(16,185,129,${intensity * 0.25})`;
  if (v < 0) return `rgba(239,68,68,${intensity * 0.25})`;
  return "";
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function EquityTooltip({
  active, payload, label, benchmarkLabel,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  benchmarkLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-500">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === "equity" ? "You" : benchmarkLabel}:{" "}
          ${p.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

function RollingTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-500">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === "pnl" ? "30d P&L" : "30d Win Rate"}:{" "}
          {p.name === "pnl" ? `$${p.value.toLocaleString()}` : `${p.value}%`}
        </p>
      ))}
    </div>
  );
}

// ─── Risk metric card ─────────────────────────────────────────────────────────

function RiskCard({
  label, value, hint, index,
}: {
  label: string;
  value: string;
  hint: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tighter text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-600">{hint}</p>
    </motion.div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function PerformanceClient({
  equitySeries,
  benchmarkSeries,
  benchmarkLabel,
  benchmarkParam,
  riskMetrics,
  rollingData,
  monthlyReturns,
  startingBalance,
  metrics,
}: {
  equitySeries: EquityPoint[];
  benchmarkSeries: EquityPoint[];
  benchmarkLabel: string;
  benchmarkParam: string;
  riskMetrics: RiskMetrics;
  rollingData: RollingPoint[];
  monthlyReturns: MonthlyReturns[];
  startingBalance: number;
  metrics: TradingMetrics;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [rollingMetric, setRollingMetric] = useState<"pnl" | "winRate">("pnl");
  const [customPct, setCustomPct] = useState(20);

  function setBenchmark(b: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("benchmark", b);
    startTransition(() => router.push(`?${p.toString()}`));
  }

  // Merge equity + benchmark into one array for Recharts
  const comparisonData = equitySeries.map((pt, i) => ({
    date: pt.date,
    equity: pt.equity,
    benchmark: benchmarkSeries[i]?.equity ?? null,
  }));

  const allEquities = [
    ...equitySeries.map((p) => p.equity),
    ...benchmarkSeries.map((p) => p.equity),
    startingBalance,
  ];
  const minY = Math.min(...allEquities);
  const maxY = Math.max(...allEquities);
  const pad = (maxY - minY) * 0.08 || startingBalance * 0.05;
  const yDomain: [number, number] = [Math.floor(minY - pad), Math.ceil(maxY + pad)];

  const isEmpty = equitySeries.length === 0;

  return (
    <div className="space-y-6">
      {/* ── Risk metric cards ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <RiskCard
          label="Sharpe Ratio"
          value={riskMetrics.sharpe.toFixed(2)}
          hint="Return per unit of total risk (annualised)"
          index={0}
        />
        <RiskCard
          label="Sortino Ratio"
          value={riskMetrics.sortino === 99 ? "∞" : riskMetrics.sortino.toFixed(2)}
          hint="Return per unit of downside risk"
          index={1}
        />
        <RiskCard
          label="Calmar Ratio"
          value={riskMetrics.calmar === 99 ? "∞" : riskMetrics.calmar.toFixed(2)}
          hint="Annualised return ÷ max drawdown %"
          index={2}
        />
        <RiskCard
          label="Consistency"
          value={`${riskMetrics.consistencyScore.toFixed(1)}`}
          hint="0–100 · lower CV = higher score"
          index={3}
        />
      </div>

      {/* ── Equity comparison chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Equity Curve vs Benchmark
          </span>

          {/* Benchmark switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {(["sp500", "flat", "custom"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => b === "custom" ? setBenchmark(`custom:${customPct}`) : setBenchmark(b)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs transition-colors",
                  (b === "custom" ? benchmarkParam.startsWith("custom:") : benchmarkParam === b)
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {b === "sp500" ? "S&P 500" : b === "flat" ? "Flat" : "Custom"}
              </button>
            ))}
            {benchmarkParam.startsWith("custom:") && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={customPct}
                  onChange={(e) => setCustomPct(Number(e.target.value))}
                  className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                />
                <span className="text-xs text-zinc-500">% / yr</span>
                <button
                  type="button"
                  onClick={() => setBenchmark(`custom:${customPct}`)}
                  className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="flex h-[320px] items-center justify-center text-sm text-zinc-600">
            No trades yet — log your first trade to see your equity curve.
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1f" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={yDomain} tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={yFmt} width={60} />
                <ReferenceLine y={startingBalance} stroke="#3f3f46" strokeDasharray="4 4" />
                <Tooltip content={<EquityTooltip benchmarkLabel={benchmarkLabel} />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-zinc-400">
                      {value === "equity" ? "You" : benchmarkLabel}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#perfGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#52525b"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  fill="none"
                  dot={false}
                  activeDot={{ r: 3, fill: "#71717a", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* ── Rolling performance chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            30-Day Rolling Performance
          </span>
          <div className="flex gap-2">
            {(["pnl", "winRate"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRollingMetric(m)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs transition-colors",
                  rollingMetric === m ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {m === "pnl" ? "P&L" : "Win Rate"}
              </button>
            ))}
          </div>
        </div>

        {rollingData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-zinc-600">
            Not enough data yet.
          </div>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid stroke="#1c1c1f" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => rollingMetric === "pnl" ? yFmt(v) : `${v}%`}
                  width={55}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="4 4" />
                <Tooltip content={<RollingTooltip />} />
                <Line
                  type="monotone"
                  dataKey={rollingMetric}
                  stroke={rollingMetric === "pnl" ? "#34d399" : "#818cf8"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* ── Monthly returns table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
      >
        <div className="mb-5">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Monthly Returns
          </span>
        </div>

        {monthlyReturns.length === 0 ? (
          <p className="text-sm text-zinc-600">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr>
                  <th className="pb-3 text-left font-medium text-zinc-500">Year</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="pb-3 text-center font-medium text-zinc-500">{m}</th>
                  ))}
                  <th className="pb-3 text-center font-medium text-zinc-500">Annual</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReturns.map((row) => (
                  <tr key={row.year} className="border-t border-white/[0.04]">
                    <td className="py-2 pr-4 font-medium text-zinc-300">{row.year}</td>
                    {row.months.map((v, i) => (
                      <td
                        key={i}
                        className={cn("py-2 text-center tabular-nums", pctColor(v))}
                        style={{ backgroundColor: pctBg(v) }}
                      >
                        {v !== null ? `${v > 0 ? "+" : ""}${v.toFixed(1)}%` : "—"}
                      </td>
                    ))}
                    <td
                      className={cn("py-2 text-center font-semibold tabular-nums", pctColor(row.annual))}
                      style={{ backgroundColor: pctBg(row.annual) }}
                    >
                      {row.annual !== null
                        ? `${row.annual > 0 ? "+" : ""}${row.annual.toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Additional metrics strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.37, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
      >
        {[
          { label: "Profit Factor", value: metrics.profitFactor >= 999 ? "∞" : metrics.profitFactor.toFixed(2), hint: "Gross profit ÷ gross loss" },
          { label: "Recovery Factor", value: metrics.recoveryFactor >= 999 ? "∞" : metrics.recoveryFactor.toFixed(2), hint: "Net P&L ÷ max drawdown" },
          { label: "Avg Win", value: `$${metrics.averageWin.toFixed(2)}`, hint: `Over ${metrics.wins} winning trades` },
          { label: "Avg Loss", value: `$${metrics.averageLoss.toFixed(2)}`, hint: `Over ${metrics.losses} losing trades` },
        ].map((c, i) => (
          <RiskCard key={c.label} label={c.label} value={c.value} hint={c.hint} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
