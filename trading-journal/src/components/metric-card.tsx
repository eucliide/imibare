"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  hint?: string;
  accent?: "emerald" | "red" | "zinc" | "blue";
  index?: number;
};

export function MetricCard({ label, value, hint, accent = "zinc", index = 0 }: Props) {
  const accentColor = {
    emerald: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
    zinc: "text-white",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
    >
      <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight", accentColor)}>
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-zinc-500">{hint}</div>
      )}
    </motion.div>
  );
}