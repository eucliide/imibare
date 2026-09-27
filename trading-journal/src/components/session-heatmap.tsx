"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  SESSION_LABELS,
  DAY_LABELS,
  getHeatmapExtremes,
  type HeatmapCell,
} from "@/lib/heatmap";
import { formatCompactPnl, cn } from "@/lib/utils";

type Props = { grid: HeatmapCell[][] };

export function SessionHeatmap({ grid }: Props) {
  const extremes = getHeatmapExtremes(grid);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Header row */}
        <div className="mb-1 grid grid-cols-[64px_1fr_1fr_1fr_1fr] gap-1.5">
          <div />
          {SESSION_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Body rows */}
        {grid.map((row, dayIdx) => (
          <motion.div
            key={dayIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: dayIdx * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-1.5 grid grid-cols-[64px_1fr_1fr_1fr_1fr] gap-1.5"
          >
            {/* Day label */}
            <div className="flex items-center text-xs font-medium text-zinc-500">
              {DAY_LABELS[dayIdx]}
            </div>

            {/* Session cells */}
            {row.map((cell) => (
              <HeatCell key={cell.session} cell={cell} extremes={extremes} />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HeatCell({
  cell,
  extremes,
}: {
  cell: HeatmapCell;
  extremes: { max: number; min: number };
}) {
  const [hovered, setHovered] = useState(false);

  if (cell.trades === 0) {
    return (
      <div className="relative flex h-14 items-center justify-center rounded-xl bg-white/[0.02]">
        <span className="text-[10px] text-zinc-700">—</span>
      </div>
    );
  }

  const isPositive = cell.netPnl > 0;
  const isNegative = cell.netPnl < 0;

  // Opacity scaled 0.12 → 0.55 by magnitude
  let bgStyle: React.CSSProperties = {};
  if (isPositive && extremes.max > 0) {
    const opacity = 0.12 + (cell.netPnl / extremes.max) * 0.43;
    bgStyle = { backgroundColor: `rgba(16,185,129,${opacity.toFixed(3)})` };
  } else if (isNegative && extremes.min < 0) {
    const opacity = 0.12 + (Math.abs(cell.netPnl) / Math.abs(extremes.min)) * 0.43;
    bgStyle = { backgroundColor: `rgba(244,63,94,${opacity.toFixed(3)})` };
  }

  return (
    <div
      className="relative flex h-14 cursor-default flex-col items-center justify-center rounded-xl border border-white/[0.04] transition-all duration-150 hover:border-white/10"
      style={bgStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className={cn(
          "text-xs font-semibold tabular-nums tracking-tight",
          isPositive && "text-emerald-300",
          isNegative && "text-rose-300"
        )}
      >
        {formatCompactPnl(cell.netPnl)}
      </span>
      <span className="mt-0.5 text-[9px] text-zinc-500">
        {cell.trades} trade{cell.trades !== 1 ? "s" : ""}
      </span>

      {/* Tooltip */}
      {hovered && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs shadow-xl">
          <p className={cn("font-semibold", isPositive ? "text-emerald-400" : "text-rose-400")}>
            {cell.netPnl > 0 ? "+" : ""}
            {cell.netPnl.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-0.5 text-zinc-400">
            {cell.trades} trade{cell.trades !== 1 ? "s" : ""} · {cell.winRate.toFixed(1)}% win
          </p>
        </div>
      )}
    </div>
  );
}
