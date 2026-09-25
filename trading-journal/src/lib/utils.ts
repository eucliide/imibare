import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats P&L with proper comma grouping and consistent decimals.
 * Examples:
 *   4537 => "+$4,537.00"
 *   -148  => "-$148.00"
 *   0     => "$0.00"
 */
export function formatPnl(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (num === 0) return `$${formatted}`;
  return `${num > 0 ? "+" : "-"}$${formatted}`;
}

/** Compact P&L for tight spaces: +$4.5k, -$148, +$42 */
export function formatCompactPnl(value: number): string {
  const abs = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  if (abs >= 100) return `${sign}$${Math.round(abs)}`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Short absolute date: "Aug 27, 2026" */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** Relative date: "2 days ago", "3 weeks ago" */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** 24h time: "14:32" */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Semantic outcome styles — the single source of truth */
export function getOutcomeStyles(outcome: "WIN" | "LOSS" | "BREAKEVEN") {
  switch (outcome) {
    case "WIN":
      return {
        text: "text-emerald-400",
        border: "border-l-emerald-500",
        bg: "bg-emerald-500/[0.03]",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        glow: "shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]",
      };
    case "LOSS":
      return {
        text: "text-rose-400",
        border: "border-l-rose-500",
        bg: "bg-rose-500/[0.03]",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        glow: "shadow-[0_0_40px_-12px_rgba(244,63,94,0.25)]",
      };
    default:
      return {
        text: "text-zinc-400",
        border: "border-l-zinc-600",
        bg: "bg-zinc-500/[0.02]",
        badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
        glow: "",
      };
  }
}