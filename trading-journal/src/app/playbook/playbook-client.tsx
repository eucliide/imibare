"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { createSetup, deleteSetup, getSetupTradeCount } from "./actions";
import { rankSetupsBy, type SetupStats, type RankMetric } from "@/lib/playbook-stats";
import { AnimatedNumber } from "@/components/animated-number";
import { cn, formatPnl } from "@/lib/utils";

type Setup = {
  id: string;
  name: string;
  rules: string;
  createdAt: Date;
};

const METRICS: { value: RankMetric; label: string }[] = [
  { value: "netPnl", label: "Net P&L" },
  { value: "winRate", label: "Win Rate" },
  { value: "profitFactor", label: "Profit Factor" },
  { value: "expectancy", label: "Expectancy" },
  { value: "totalTrades", label: "Trade Count" },
];

export function PlaybookClient({
  setups,
  setupStats,
}: {
  setups: Setup[];
  setupStats: SetupStats[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<RankMetric>("netPnl");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await createSetup(formData);
    if (result.success) {
      (document.getElementById("setup-form") as HTMLFormElement)?.reset();
      setIsOpen(false);
    } else {
      setError(result.error || "Something went wrong.");
    }
    setIsSubmitting(false);
  }

  const ranked = rankSetupsBy(setupStats, metric);

  return (
    <div className="space-y-8">
      {/* ── Performance Leaderboard ── */}
      {ranked.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Performance Leaderboard
            </h2>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as RankMetric)}
              className="appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              {METRICS.map((m) => (
                <option key={m.value} value={m.value} className="bg-[#121214]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr] gap-4 border-b border-white/[0.04] px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <div>Setup</div>
            <div className="text-right">Trades</div>
            <div className="text-right">Net P&L</div>
            <div className="text-right">Win %</div>
            <div className="text-right">P.Factor</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {ranked.map((s, i) => (
              <motion.div
                key={s.setupId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/playbook/${s.setupId}`}
                  className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr] gap-4 px-6 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-200">
                      {s.setupName}
                    </span>
                  </div>
                  <div className="text-right text-sm tabular-nums text-zinc-400">
                    {s.totalTrades}
                  </div>
                  <div
                    className={cn(
                      "text-right text-sm font-semibold tabular-nums tracking-tight",
                      s.netPnl > 0 && "text-emerald-400",
                      s.netPnl < 0 && "text-rose-400",
                      s.netPnl === 0 && "text-zinc-500"
                    )}
                  >
                    {formatPnl(s.netPnl)}
                  </div>
                  <div className="text-right text-sm tabular-nums text-zinc-400">
                    {s.winRate.toFixed(1)}%
                  </div>
                  <div className="text-right text-sm tabular-nums text-zinc-400">
                    {s.profitFactor >= 999 ? "∞" : s.profitFactor.toFixed(2)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add setup toggle ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-6 py-4 text-left transition-colors hover:border-white/20"
      >
        <span className="text-sm font-medium text-white">
          {isOpen ? "Cancel" : "+ Add setup to playbook"}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg text-zinc-500"
        >
          +
        </motion.span>
      </button>

      {/* ── Collapsible form ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <form
              id="setup-form"
              action={handleSubmit}
              className="space-y-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Setup name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. LONDON SWEEP + FVG"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Rules — one per line. Be specific.
                </label>
                <textarea
                  name="rules"
                  rows={6}
                  required
                  placeholder={`Liquidity swept above Asia high\nDisplacement through structure\nEntry on FVG retrace\nStop beyond swept wick\nTarget: next H4 or D1 level`}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Add setup"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Setup cards ── */}
      {setups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <p className="text-lg font-medium text-white">No setups yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Define your first strategy to start tagging trades.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {setups.map((setup, i) => {
              const stats = setupStats.find((s) => s.setupId === setup.id);
              return (
                <SetupCard key={setup.id} setup={setup} stats={stats ?? null} index={i} />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SetupCard({
  setup,
  stats,
  index,
}: {
  setup: Setup;
  stats: SetupStats | null;
  index: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tradeCount, setTradeCount] = useState<number | null>(null);

  async function handleConfirmClick() {
    const count = await getSetupTradeCount(setup.id);
    setTradeCount(count);
    setConfirming(true);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteSetup(setup.id);
  }

  const rules = setup.rules
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const hasTrades = stats && stats.totalTrades > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all duration-300 hover:shadow-[0_0_40px_-16px_rgba(16,185,129,0.25)]"
    >
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">{setup.name}</h2>

        {!confirming ? (
          <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Link
              href={`/playbook/${setup.id}`}
              className="text-xs text-zinc-500 hover:text-white"
            >
              View deep dive →
            </Link>
            <button
              onClick={handleConfirmClick}
              className="text-xs text-zinc-500 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="space-y-1 text-right text-xs">
            {tradeCount !== null && tradeCount > 0 && (
              <p className="text-zinc-500">
                This will unlink {tradeCount} trade{tradeCount !== 1 ? "s" : ""}. Trades will not be deleted.
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-500/10 px-2 py-1 font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                {deleting ? "..." : "Confirm delete"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md px-2 py-1 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500/60" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      {/* Stats row */}
      <div className="mt-5 border-t border-white/[0.04] pt-4">
        {!hasTrades ? (
          <p className="text-xs text-zinc-600">Not traded yet</p>
        ) : (
          <div className="flex flex-wrap gap-6 text-xs">
            <div>
              <p className="text-zinc-600">Trades</p>
              <p className="mt-0.5 font-medium text-zinc-300">{stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-zinc-600">Net P&L</p>
              <p
                className={cn(
                  "mt-0.5 font-semibold tabular-nums",
                  stats.netPnl > 0 ? "text-emerald-400" : stats.netPnl < 0 ? "text-rose-400" : "text-zinc-400"
                )}
              >
                <AnimatedNumber
                  value={Math.abs(stats.netPnl)}
                  prefix={stats.netPnl >= 0 ? "+$" : "-$"}
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-zinc-600">Win Rate</p>
              <p className="mt-0.5 font-medium text-zinc-300">
                <AnimatedNumber value={stats.winRate} suffix="%" decimals={1} />
              </p>
            </div>
            <div>
              <p className="text-zinc-600">Expectancy</p>
              <p
                className={cn(
                  "mt-0.5 font-medium tabular-nums",
                  stats.expectancy > 0 ? "text-emerald-400" : stats.expectancy < 0 ? "text-rose-400" : "text-zinc-400"
                )}
              >
                <AnimatedNumber
                  value={Math.abs(stats.expectancy)}
                  prefix={stats.expectancy >= 0 ? "+$" : "-$"}
                  decimals={2}
                />
                {stats.expectancyProvisional && (
                  <span className="ml-1 text-zinc-500">(provisional)</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
