import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines tailwind classes safely, resolving conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a P&L number into a signed currency string
export function formatPnl(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const formatted = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${num >= 0 ? "+" : "-"}$${formatted}`;
}

// Formats a date consistently
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Returns the semantic color tokens based on outcome
export function getOutcomeStyles(outcome: "WIN" | "LOSS" | "BREAKEVEN") {
  switch (outcome) {
    case "WIN":
      return {
        text: "text-emerald-400",
        border: "border-l-emerald-500/60",
        bg: "bg-emerald-500/5",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "LOSS":
      return {
        text: "text-red-400",
        border: "border-l-red-500/60",
        bg: "bg-red-500/5",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
      };
    default:
      return {
        text: "text-zinc-400",
        border: "border-l-zinc-500/60",
        bg: "bg-zinc-500/5",
        badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      };
  }
}