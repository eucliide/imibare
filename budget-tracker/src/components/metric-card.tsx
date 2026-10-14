"use client";

import { motion } from "motion/react";
import { Card } from "./card";
import { SectionLabel } from "./section-label";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "emerald" | "rose" | "blue" | "zinc";
  index?: number;
  children?: React.ReactNode;
};

const accentColors = {
  emerald: "text-emerald-400",
  rose: "text-rose-400",
  blue: "text-blue-400",
  zinc: "text-zinc-300",
};

export function MetricCard({
  label,
  value,
  hint,
  accent = "zinc",
  index = 0,
  children,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card>
        <SectionLabel>{label}</SectionLabel>
        <div className={cn("mt-3 text-3xl font-bold tracking-tighter", accentColors[accent])}>
          {value}
        </div>
        {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
        {children}
      </Card>
    </motion.div>
  );
}
