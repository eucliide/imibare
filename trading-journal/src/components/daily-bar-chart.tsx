"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type DayBar = {
  date: string; // yyyy-MM-dd
  pnl: number;
};

export function DailyBarChart({ data }: { data: DayBar[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-zinc-600">
        No trades yet
      </div>
    );
  }

  // Find the max absolute value for scaling
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl)), 1);

  return (
    <div className="flex h-[120px] items-end justify-between gap-1">
      {data.map((day, i) => {
        const heightPct = (Math.abs(day.pnl) / maxAbs) * 100;
        const isPositive = day.pnl > 0;
        const isNegative = day.pnl < 0;

        return (
          <div
            key={day.date}
            className="group relative flex h-full flex-1 flex-col justify-end"
          >
            {/* The bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{
                duration: 0.5,
                delay: i * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "w-full rounded-sm",
                isPositive && "bg-emerald-500/60 group-hover:bg-emerald-400",
                isNegative && "bg-red-500/60 group-hover:bg-red-400",
                !isPositive && !isNegative && "bg-zinc-600/60"
              )}
            />

            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#121214] px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-zinc-500">{day.date}</div>
              <div
                className={cn(
                  isPositive && "text-emerald-400",
                  isNegative && "text-red-400"
                )}
              >
                {day.pnl >= 0 ? "+" : "-"}$
                {Math.abs(day.pnl).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}