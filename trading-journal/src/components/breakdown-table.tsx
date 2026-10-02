"use client";

import { motion } from "motion/react";
import { cn, formatPnl } from "@/lib/utils";
import type { GroupedStats } from "@/lib/breakdown";

type Props = {
  title: string;
  rows: GroupedStats[];
  index?: number;
};

export function BreakdownTable({ title, rows, index = 0 }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-xs text-zinc-600">No trades to analyze yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
    >
      <div className="border-b border-white/[0.05] px-6 py-4">
        <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
      </div>

      <div className="divide-y divide-white/[0.03]">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
          <div>Label</div>
          <div className="text-right">Trades</div>
          <div className="text-right">Net P&L</div>
          <div className="text-right">Win %</div>
        </div>

        {rows.map((row) => {
          const isPositive = row.netPnl > 0;
          const isNegative = row.netPnl < 0;

          return (
            <div
              key={row.label}
              className="group grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <div className="truncate text-sm font-medium text-zinc-200">
                {row.label}
              </div>
              <div className="text-right text-sm tabular-nums text-zinc-500">
                {row.trades}
              </div>
              <div
                className={cn(
                  "text-right text-sm font-semibold tabular-nums tracking-tight",
                  isPositive && "text-emerald-400",
                  isNegative && "text-rose-400",
                  !isPositive && !isNegative && "text-zinc-500"
                )}
              >
                {formatPnl(row.netPnl)}
              </div>
              {/* Win rate with inline bar */}
              <div className="flex flex-col items-end justify-center gap-1">
                <span className="text-sm tabular-nums text-zinc-400">
                  {row.winRate.toFixed(1)}%
                </span>
                <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-emerald-500/50 transition-all duration-500"
                    style={{ width: `${Math.min(row.winRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
