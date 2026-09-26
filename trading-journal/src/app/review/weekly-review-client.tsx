"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/metric-card";
import { AnimatedNumber } from "@/components/animated-number";
import { cn, formatPnl, formatCompactPnl } from "@/lib/utils";
import { upsertWeeklyReview } from "./actions";
import type { WeeklyStats } from "@/lib/weekly-stats";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mood = "confident" | "neutral" | "frustrated" | "disciplined";

type Props = {
  weekParam: string;
  weekStart: string; // ISO string
  weekNumber: number;
  weekYear: number;
  weekRangeLabel: string;
  stats: WeeklyStats;
  dailyPnl: Record<string, number>;
  savedNotes: string;
  savedMood: Mood | null;
  prevWeekParam: string;
  nextWeekParam: string;
  isCurrentWeek: boolean;
};

const MOODS: { value: Mood; label: string }[] = [
  { value: "confident", label: "Confident" },
  { value: "neutral", label: "Neutral" },
  { value: "frustrated", label: "Frustrated" },
  { value: "disciplined", label: "Disciplined" },
];

// Mon–Sun labels for the trading days strip
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Save button states ───────────────────────────────────────────────────────
type SaveState = "idle" | "saving" | "saved";

// ─── Component ────────────────────────────────────────────────────────────────

export function WeeklyReviewClient({
  weekParam,
  weekStart,
  weekNumber,
  weekYear,
  weekRangeLabel,
  stats,
  dailyPnl,
  savedNotes,
  savedMood,
  prevWeekParam,
  nextWeekParam,
  isCurrentWeek,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState(savedNotes);
  const [mood, setMood] = useState<Mood | null>(savedMood);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasUnsavedChanges = notes !== savedNotes || mood !== savedMood;

  // ── Navigation ──────────────────────────────────────────────────────────
  function navigate(param: string) {
    startTransition(() => {
      router.push(`/review?week=${param}`);
    });
  }

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);

    const result = await upsertWeeklyReview(weekParam, notes, mood);

    if (result.success) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } else {
      setSaveState("idle");
      setSaveError(result.error);
    }
  }

  // ── Trading days strip data ─────────────────────────────────────────────
  // Build Mon–Sun dates for this week
  const weekStartDate = new Date(weekStart);
  const dayDates = DAY_LABELS.map((_, i) => {
    const d = new Date(weekStartDate);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const todayKey = new Date().toISOString().split("T")[0];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── A. Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Week {weekNumber}, {weekYear}
          </span>
          {isCurrentWeek && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              This week
            </span>
          )}
        </div>

        <h1 className="mt-2 text-4xl font-bold tracking-tighter text-white">
          {weekRangeLabel}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {stats.totalTrades === 0
            ? "No trades this week"
            : `${stats.totalTrades} ${stats.totalTrades === 1 ? "trade" : "trades"} · ${stats.tradingDays} trading ${stats.tradingDays === 1 ? "day" : "days"}`}
        </p>
      </motion.div>

      {/* ── B. Week Navigation ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2"
      >
        <button
          onClick={() => navigate(prevWeekParam)}
          disabled={isPending}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
        >
          ← Previous week
        </button>
        <button
          onClick={() => navigate(nextWeekParam)}
          disabled={isCurrentWeek || isPending}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next week →
        </button>
      </motion.div>

      {/* ── Empty week state OR metrics ────────────────────────────────── */}
      {stats.totalTrades === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-12 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
        >
          <p className="text-lg font-semibold tracking-tight text-white">
            No trades this week
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Take the day. Review your playbook or plan the next session.
          </p>
        </motion.div>
      ) : (
        <>
          {/* ── C. Metric Grid ───────────────────────────────────────── */}
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
              value={
                stats.wins + stats.losses > 0 ? (
                  <AnimatedNumber value={stats.winRate} suffix="%" decimals={1} />
                ) : (
                  <span className="text-zinc-500">—</span>
                )
              }
              hint={`${stats.wins}W · ${stats.losses}L`}
              accent="zinc"
              index={1}
            />
            <MetricCard
              label="Biggest Win"
              value={
                stats.biggestWin ? (
                  <AnimatedNumber
                    value={stats.biggestWin.pnl}
                    prefix="+$"
                    decimals={2}
                  />
                ) : (
                  <span className="text-zinc-500">—</span>
                )
              }
              hint={stats.biggestWin?.symbol}
              accent="emerald"
              index={2}
            />
            <MetricCard
              label="Biggest Loss"
              value={
                stats.biggestLoss ? (
                  <AnimatedNumber
                    value={Math.abs(stats.biggestLoss.pnl)}
                    prefix="-$"
                    decimals={2}
                  />
                ) : (
                  <span className="text-zinc-500">—</span>
                )
              }
              hint={stats.biggestLoss?.symbol}
              accent="rose"
              index={3}
            />
          </div>

          {/* ── D. Week at a Glance ──────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Best Symbol */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Best Symbol
              </div>
              {stats.bestSymbol ? (
                <div className="mt-3">
                  <div className="text-xl font-semibold tracking-tight text-white">
                    {stats.bestSymbol.label}
                  </div>
                  <div className="mt-1 text-[28px] font-semibold leading-none tracking-tighter text-emerald-400">
                    <AnimatedNumber
                      value={stats.bestSymbol.pnl}
                      prefix={stats.bestSymbol.pnl >= 0 ? "+$" : "-$"}
                      decimals={2}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-zinc-500">
                    {stats.bestSymbol.trades} {stats.bestSymbol.trades === 1 ? "trade" : "trades"}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No trades this week</p>
              )}
            </motion.div>

            {/* Best Strategy */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Best Strategy
              </div>
              {stats.bestStrategy ? (
                <div className="mt-3">
                  <div className="text-xl font-semibold tracking-tight text-white">
                    {stats.bestStrategy.label}
                  </div>
                  <div className="mt-1 text-[28px] font-semibold leading-none tracking-tighter text-emerald-400">
                    <AnimatedNumber
                      value={stats.bestStrategy.pnl}
                      prefix={stats.bestStrategy.pnl >= 0 ? "+$" : "-$"}
                      decimals={2}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-zinc-500">
                    {stats.bestStrategy.trades} trades
                  </div>
                  {stats.worstStrategy && (
                    <div className="mt-2 text-xs text-rose-400/70">
                      Worst: {stats.worstStrategy.label} ({formatPnl(stats.worstStrategy.pnl)})
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">
                  Need ≥ 2 trades per strategy
                </p>
              )}
            </motion.div>
          </div>

          {/* ── E. Trading Days Strip ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5"
          >
            <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Trading Days
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label, i) => {
                const key = dayDates[i];
                const pnl = dailyPnl[key];
                const hasTrade = pnl !== undefined;
                const isPositive = hasTrade && pnl > 0;
                const isNegative = hasTrade && pnl < 0;
                const isToday = key === todayKey;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.36 + i * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors",
                      isPositive && "border-emerald-500/20 bg-emerald-500/[0.07]",
                      isNegative && "border-rose-500/20 bg-rose-500/[0.07]",
                      !hasTrade && "border-white/[0.05] bg-white/[0.02]",
                      isToday && "ring-1 ring-white/20"
                    )}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      {label}
                    </span>
                    {hasTrade ? (
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-tight",
                          isPositive && "text-emerald-400",
                          isNegative && "text-rose-400",
                          pnl === 0 && "text-zinc-500"
                        )}
                      >
                        {formatCompactPnl(pnl)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-700">—</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {/* ── F. Reflection ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: stats.totalTrades === 0 ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
      >
        <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Reflection
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          placeholder="What went well? What would I do differently? Which setups worked, which didn't?"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        />

        {/* Mood selector */}
        <div className="mt-4 flex flex-wrap gap-2">
          {MOODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMood(mood === value ? null : value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                mood === value
                  ? "border-emerald-500 bg-emerald-500 text-black"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Save row */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="relative overflow-hidden rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-60"
          >
            <AnimatePresence mode="wait">
              {saveState === "idle" && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  Save review
                </motion.span>
              )}
              {saveState === "saving" && (
                <motion.span
                  key="saving"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  Saving...
                </motion.span>
              )}
              {saveState === "saved" && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  Saved ✓
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {hasUnsavedChanges && saveState === "idle" && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-amber-400"
              >
                Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>

          {saveError && (
            <span className="text-xs text-rose-400">{saveError}</span>
          )}
        </div>
      </motion.div>

    </div>
  );
}
