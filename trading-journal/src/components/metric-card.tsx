"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "emerald" | "rose" | "zinc" | "blue";
  index?: number;
  children?: React.ReactNode;
};

export function MetricCard({
  label,
  value,
  hint,
  accent = "zinc",
  index = 0,
  children,
}: Props) {
  const accentColor = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    blue: "text-blue-400",
    zinc: "text-white",
  }[accent];

  const accentBorder = {
    emerald: "before:bg-emerald-500",
    rose: "before:bg-rose-500",
    blue: "before:bg-blue-500",
    zinc: "before:bg-zinc-600",
  }[accent];

  const glowColor = {
    emerald: "hover:shadow-[0_0_40px_-16px_rgba(16,185,129,0.35)]",
    rose: "hover:shadow-[0_0_40px_-16px_rgba(244,63,94,0.35)]",
    blue: "hover:shadow-[0_0_40px_-16px_rgba(59,130,246,0.35)]",
    zinc: "hover:shadow-[0_0_40px_-16px_rgba(255,255,255,0.08)]",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
        "transition-shadow duration-300",
        // accent top-border via pseudo
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:opacity-60",
        accentBorder,
        glowColor
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className={cn("mt-2.5 text-[26px] font-semibold leading-none tracking-tighter", accentColor)}>
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-zinc-600">{hint}</div>
      )}
      {children}
    </motion.div>
  );
}
