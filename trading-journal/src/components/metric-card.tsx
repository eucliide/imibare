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

  const glowColor = {
    emerald: "group-hover:shadow-[0_0_40px_-16px_rgba(16,185,129,0.4)]",
    rose: "group-hover:shadow-[0_0_40px_-16px_rgba(244,63,94,0.4)]",
    blue: "group-hover:shadow-[0_0_40px_-16px_rgba(59,130,246,0.4)]",
    zinc: "group-hover:shadow-[0_0_40px_-16px_rgba(255,255,255,0.1)]",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 transition-all duration-300",
        glowColor
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className={cn("mt-2.5 text-[28px] font-semibold leading-none tracking-tighter", accentColor)}>
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-zinc-500">{hint}</div>
      )}
      {children}
    </motion.div>
  );
}