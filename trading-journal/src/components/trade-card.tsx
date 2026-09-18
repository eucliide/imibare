"use client";

import { motion } from "motion/react";
import { cn, formatPnl, formatDate, formatTime, getOutcomeStyles } from "@/lib/utils";

type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  strategy: string | null;
  notes: string | null;
  openedAt: Date;
  closedAt: Date;
};

export function TradeCard({ trade, index }: { trade: Trade; index: number }) {
  const styles = getOutcomeStyles(trade.outcome);
  const date = formatDate(trade.closedAt);
  const time = formatTime(trade.closedAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05, // Staggered entrance
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--card-border)] border-l-2 bg-[var(--card)] p-6 transition-colors",
        styles.border
      )}
    >
      {/* Subtle outcome glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          styles.bg
        )}
      />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

        {/* Left: P&L + Metadata */}
        <div className="flex-1">
          <div className={cn("text-3xl font-semibold tracking-tight", styles.text)}>
            {formatPnl(trade.netPnl)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-zinc-500">
            <span>{date}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>{time}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span className="font-medium text-zinc-300">{trade.symbol}</span>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide",
                trade.direction === "LONG"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400"
              )}
            >
              {trade.direction}
            </span>
            {trade.strategy && (
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-300">
                {trade.strategy}
              </span>
            )}
          </div>

          {trade.notes && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {trade.notes}
            </p>
          )}
        </div>

        {/* Right: Future chart thumbnail slot */}
        <div className="hidden md:block">
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white">
            View chart
          </button>
        </div>
      </div>
    </motion.article>
  );
}