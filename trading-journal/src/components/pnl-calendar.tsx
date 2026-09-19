"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatPnl } from "@/lib/utils";
import {
  buildMonthGrid,
  formatMonthLabel,
  getMonthOffset,
  WEEKDAY_LABELS,
} from "@/lib/calendar";

type Props = {
  dailyPnl: Record<string, number>;
};

export function PnlCalendar({ dailyPnl }: Props) {
  const [month, setMonth] = useState(new Date());

  const grid = useMemo(
    () => buildMonthGrid(month, dailyPnl),
    [month, dailyPnl]
  );

  // Split into weeks for row-based rendering
  const weeks: (typeof grid)[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {formatMonthLabel(month)}
        </h3>
        <div className="flex items-center gap-1">
          <NavButton
            direction="prev"
            onClick={() => setMonth(getMonthOffset(month, -1))}
          />
          <NavButton
            direction="next"
            onClick={() => setMonth(getMonthOffset(month, 1))}
          />
        </div>
      </div>

      {/* Weekday Header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-medium uppercase tracking-widest text-zinc-600"
          >
            {label.slice(0, 1)}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <AnimatePresence mode="wait">
        <motion.div
          key={formatMonthLabel(month)}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-1"
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day) => (
                <DayCell key={day.dateKey} day={day} />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DayCell({
  day,
}: {
  day: {
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    pnl: number | null;
  };
}) {
  const hasPnl = day.pnl !== null;
  const isPositive = hasPnl && day.pnl! > 0;
  const isNegative = hasPnl && day.pnl! < 0;

  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col justify-between rounded-lg border p-1.5 transition-colors",
        // Base border
        "border-white/5",
        // Current month vs other month
        !day.isCurrentMonth && "opacity-30",
        // Today ring
        day.isToday && "ring-1 ring-white/20",
        // Outcome background
        isPositive && "border-emerald-500/20 bg-emerald-500/10",
        isNegative && "border-red-500/20 bg-red-500/10",
        !hasPnl && "bg-white/[0.02]"
      )}
    >
      <span
        className={cn(
          "text-[10px] font-medium",
          day.isToday ? "text-white" : "text-zinc-500"
        )}
      >
        {day.dayNumber}
      </span>

      {hasPnl && (
        <span
          className={cn(
            "text-[10px] font-semibold tracking-tight",
            isPositive && "text-emerald-400",
            isNegative && "text-red-400",
            day.pnl === 0 && "text-zinc-500"
          )}
        >
          {formatCompactPnl(day.pnl!)}
        </span>
      )}
    </div>
  );
}

function NavButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
      aria-label={direction === "prev" ? "Previous month" : "Next month"}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}

// Compact formatter for tight spaces: +$3.5k, -$148, +$42
function formatCompactPnl(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? "+" : "-";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1)}k`;
  }
  if (abs >= 100) {
    return `${sign}$${Math.round(abs)}`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}