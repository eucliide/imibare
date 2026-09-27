"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { MetricCard } from "@/components/metric-card";
import { AnimatedNumber } from "@/components/animated-number";
import { cn, formatDate, formatTime, formatPnl } from "@/lib/utils";
import { updateSetup, deleteSetup, attachSetupToTrades } from "../actions";
import type { SetupStats } from "@/lib/playbook-stats";
import { useRouter } from "next/navigation";

type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  openedAt: Date;
  closedAt: Date;
  strategy: string | null;
};

type UntaggedTrade = {
  id: string;
  symbol: string;
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  closedAt: Date;
};

type Setup = {
  id: string;
  name: string;
  rules: string;
};

function yTickFormatter(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const pnl = payload[0].value;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs">
      <p className="text-zinc-500">{label}</p>
      <p className={cn("mt-0.5 font-medium", pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
        {formatPnl(pnl)}
      </p>
    </div>
  );
}

export function SetupDeepDive({
  setup,
  stats,
  equityCurve,
  trades,
  untaggedTrades,
}: {
  setup: Setup;
  stats: SetupStats;
  equityCurve: { date: string; pnl: number }[];
  trades: Trade[];
  untaggedTrades: UntaggedTrade[];
}) {
  const router = useRouter();
  const [editingRules, setEditingRules] = useState(false);
  const [rulesValue, setRulesValue] = useState(setup.rules);
  const [savingRules, setSavingRules] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBulkLink, setShowBulkLink] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [linking, setLinking] = useState(false);
  const [search, setSearch] = useState("");

  async function handleSaveRules() {
    setSavingRules(true);
    const fd = new FormData();
    fd.set("name", setup.name);
    fd.set("rules", rulesValue);
    await updateSetup(setup.id, fd);
    setEditingRules(false);
    setSavingRules(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteSetup(setup.id);
    router.push("/playbook");
  }

  async function handleBulkLink() {
    setLinking(true);
    await attachSetupToTrades(setup.id, Array.from(selectedIds));
    setShowBulkLink(false);
    setSelectedIds(new Set());
    setLinking(false);
    router.refresh();
  }

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rules = rulesValue
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const filteredUntagged = untaggedTrades.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(t.closedAt).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── A. Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <Link
            href="/playbook"
            className="text-xs text-zinc-500 transition-colors hover:text-white"
          >
            ← Back to Playbook
          </Link>
          <h1 className="mt-2 text-4xl font-bold tracking-tighter text-white">
            {setup.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {stats.totalTrades === 0
              ? "Not traded yet"
              : `${stats.totalTrades} trade${stats.totalTrades !== 1 ? "s" : ""} since ${formatDate(stats.firstTradeAt!)}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-6">
          <button
            onClick={() => setEditingRules(!editingRules)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            {editingRules ? "Cancel" : "Edit rules"}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              Delete setup
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">
                Unlinks {stats.totalTrades} trade{stats.totalTrades !== 1 ? "s" : ""}. Trades survive.
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-500/10 px-2 py-1 font-medium text-red-400 hover:bg-red-500/20"
              >
                {deleting ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-2 py-1 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── B. Rules card ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Rules
          </span>
          {editingRules && (
            <button
              onClick={handleSaveRules}
              disabled={savingRules}
              className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              {savingRules ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {editingRules ? (
          <textarea
            value={rulesValue}
            onChange={(e) => setRulesValue(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        ) : (
          <ul className="space-y-1.5">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500/60" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── C. Metric grid ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MetricCard
          label="Net P&L"
          value={
            <AnimatedNumber
              value={Math.abs(stats.netPnl)}
              prefix={stats.netPnl >= 0 ? "+$" : "-$"}
              decimals={2}
            />
          }
          accent={stats.netPnl >= 0 ? "emerald" : "rose"}
          index={0}
        />
        <MetricCard
          label="Win Rate"
          value={<AnimatedNumber value={stats.winRate} suffix="%" decimals={1} />}
          hint={`${stats.wins}W · ${stats.losses}L`}
          accent="zinc"
          index={1}
        />
        <MetricCard
          label="Profit Factor"
          value={
            stats.profitFactor >= 999 ? (
              <span>∞</span>
            ) : (
              <AnimatedNumber value={stats.profitFactor} decimals={2} />
            )
          }
          accent={stats.profitFactor >= 1.5 ? "emerald" : "zinc"}
          index={2}
        />
        <MetricCard
          label="Expectancy"
          value={
            <AnimatedNumber
              value={Math.abs(stats.expectancy)}
              prefix={stats.expectancy >= 0 ? "+$" : "-$"}
              decimals={2}
            />
          }
          hint={stats.expectancyProvisional ? "provisional" : undefined}
          accent={stats.expectancy >= 0 ? "emerald" : "rose"}
          index={3}
        />
      </div>

      {/* ── D. Equity curve ── */}
      {equityCurve.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Cumulative P&L
          </span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mt-4 h-[260px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurve}
                margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
              >
                <defs>
                  <linearGradient id="setupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1f" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={yTickFormatter}
                  width={55}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="4 4" />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#setupGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* ── E. Insights strip ── */}
      {stats.totalTrades > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            {
              label: "Average win",
              value:
                stats.wins > 0
                  ? `+$${stats.averageWin.toLocaleString("en-US", { minimumFractionDigits: 2 })} across ${stats.wins} win${stats.wins !== 1 ? "s" : ""}`
                  : "—",
            },
            {
              label: "Average loss",
              value:
                stats.losses > 0
                  ? `-$${stats.averageLoss.toLocaleString("en-US", { minimumFractionDigits: 2 })} across ${stats.losses} loss${stats.losses !== 1 ? "es" : ""}`
                  : "—",
            },
            {
              label: "Best trade",
              value: stats.bestTrade
                ? `${stats.bestTrade.symbol} +$${stats.bestTrade.pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "—",
            },
            {
              label: "Worst trade",
              value: stats.worstTrade
                ? `${stats.worstTrade.symbol} $${stats.worstTrade.pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "—",
            },
            {
              label: "Longest win streak",
              value: stats.longestWinStreak > 0 ? `${stats.longestWinStreak}` : "—",
            },
            {
              label: "Distinct trading days",
              value: `${stats.distinctDays}`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.06] bg-[var(--card)] px-4 py-3 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                {label}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-300">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── F. Trade list ── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-white">Trades</h2>
          {stats.totalTrades === 0 && untaggedTrades.length > 0 && (
            <button
              onClick={() => setShowBulkLink(true)}
              className="text-xs text-zinc-500 transition-colors hover:text-white"
            >
              Link existing trades →
            </button>
          )}
        </div>

        {trades.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-zinc-600">No trades tagged with this setup yet.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 border-b border-white/[0.04] px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              <div>Date</div>
              <div>Symbol</div>
              <div className="text-right">Net P&L</div>
              <div className="text-right">Direction</div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[...trades]
                .sort(
                  (a, b) =>
                    new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
                )
                .map((t) => {
                  const pnl = parseFloat(t.netPnl);
                  return (
                    <Link
                      key={t.id}
                      href="/journal"
                      className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="text-sm text-zinc-400">
                        {formatDate(t.closedAt)}{" "}
                        <span className="text-zinc-600">{formatTime(t.closedAt)}</span>
                      </div>
                      <div className="text-sm font-medium text-zinc-200">{t.symbol}</div>
                      <div
                        className={cn(
                          "text-right text-sm font-semibold tabular-nums tracking-tight",
                          pnl > 0 && "text-emerald-400",
                          pnl < 0 && "text-rose-400",
                          pnl === 0 && "text-zinc-500"
                        )}
                      >
                        {formatPnl(t.netPnl)}
                      </div>
                      <div className="text-right">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-medium",
                            t.direction === "LONG"
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                              : "border-red-500/20 bg-red-500/5 text-red-400"
                          )}
                        >
                          {t.direction}
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* ── Bulk-link modal ── */}
      {showBulkLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-4 w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Link existing trades to {setup.name}
              </h3>
              <button
                onClick={() => setShowBulkLink(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symbol or date…"
              className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-emerald-500/50 focus:outline-none"
            />

            <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
              {filteredUntagged.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-600">No untagged trades found.</p>
              ) : (
                filteredUntagged.map((t) => {
                  const pnl = parseFloat(t.netPnl);
                  const checked = selectedIds.has(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-3 px-2 py-2.5 transition-colors hover:bg-white/[0.02]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleId(t.id)}
                        className="accent-emerald-500"
                      />
                      <span className="flex-1 text-sm text-zinc-300">{t.symbol}</span>
                      <span className="text-xs text-zinc-500">{formatDate(t.closedAt)}</span>
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          pnl > 0 ? "text-emerald-400" : pnl < 0 ? "text-rose-400" : "text-zinc-500"
                        )}
                      >
                        {formatPnl(t.netPnl)}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkLink(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkLink}
                  disabled={selectedIds.size === 0 || linking}
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {linking ? "Linking..." : `Link ${selectedIds.size} trade${selectedIds.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
