import type { Trade } from "./analytics";
import { groupBySymbol, groupByStrategy } from "./breakdown";

export type WeeklyStats = {
  totalTrades: number;
  netPnl: number;
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
  biggestWin: { symbol: string; pnl: number } | null;
  biggestLoss: { symbol: string; pnl: number } | null;
  // Best symbol = highest net P&L
  bestSymbol: { label: string; pnl: number; trades: number } | null;
  // Best/worst strategy require >= 2 trades; worst must also be negative
  bestStrategy: { label: string; pnl: number; trades: number } | null;
  worstStrategy: { label: string; pnl: number; trades: number } | null;
  averagePnl: number;
  // Count of distinct UTC days with at least one trade
  tradingDays: number;
  // Trailing streak at the end of the week (breakevens reset it)
  currentStreak: { type: "win" | "loss" | null; count: number };
};

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeWeeklyStats(trades: Trade[]): WeeklyStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      netPnl: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      biggestWin: null,
      biggestLoss: null,
      bestSymbol: null,
      bestStrategy: null,
      worstStrategy: null,
      averagePnl: 0,
      tradingDays: 0,
      currentStreak: { type: null, count: 0 },
    };
  }

  // Sort ascending for streak calculation
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  // ── Basic counts ──────────────────────────────────────────────────────────
  let netPnl = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;
  let biggestWinPnl = -Infinity;
  let biggestWinSymbol = "";
  let biggestLossPnl = Infinity;
  let biggestLossSymbol = "";

  for (const t of sorted) {
    const pnl = parseFloat(t.netPnl);
    netPnl += pnl;
    if (pnl > 0) {
      wins++;
      if (pnl > biggestWinPnl) {
        biggestWinPnl = pnl;
        biggestWinSymbol = t.symbol;
      }
    } else if (pnl < 0) {
      losses++;
      if (pnl < biggestLossPnl) {
        biggestLossPnl = pnl;
        biggestLossSymbol = t.symbol;
      }
    } else {
      breakevens++;
    }
  }

  const decided = wins + losses;
  const winRate = decided > 0 ? r2((wins / decided) * 100) : 0;

  // ── Best symbol ───────────────────────────────────────────────────────────
  const bySymbol = groupBySymbol(trades);
  const bestSymbolRow = bySymbol[0] ?? null;
  const bestSymbol = bestSymbolRow
    ? { label: bestSymbolRow.label, pnl: r2(bestSymbolRow.netPnl), trades: bestSymbolRow.trades }
    : null;

  // ── Best / worst strategy (min 2 trades) ─────────────────────────────────
  const byStrategy = groupByStrategy(trades).filter((s) => s.trades >= 2);
  const bestStrategyRow = byStrategy[0] ?? null;
  const worstStrategyRow = byStrategy[byStrategy.length - 1] ?? null;

  const bestStrategy = bestStrategyRow
    ? { label: bestStrategyRow.label, pnl: r2(bestStrategyRow.netPnl), trades: bestStrategyRow.trades }
    : null;

  // Worst only shows if it's actually negative and different from best
  const worstStrategy =
    worstStrategyRow &&
    worstStrategyRow.netPnl < 0 &&
    worstStrategyRow.label !== bestStrategyRow?.label
      ? { label: worstStrategyRow.label, pnl: r2(worstStrategyRow.netPnl), trades: worstStrategyRow.trades }
      : null;

  // ── Trading days ──────────────────────────────────────────────────────────
  const daySet = new Set<string>();
  for (const t of trades) {
    daySet.add(new Date(t.closedAt).toISOString().split("T")[0]);
  }

  // ── Trailing streak ───────────────────────────────────────────────────────
  // Walk from the end; breakevens reset the streak
  let streakCount = 0;
  let streakType: "win" | "loss" | null = null;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const pnl = parseFloat(sorted[i].netPnl);
    const type: "win" | "loss" | null =
      pnl > 0 ? "win" : pnl < 0 ? "loss" : null;

    if (type === null) break; // breakeven resets
    if (streakType === null) {
      streakType = type;
      streakCount = 1;
    } else if (type === streakType) {
      streakCount++;
    } else {
      break;
    }
  }

  return {
    totalTrades: trades.length,
    netPnl: r2(netPnl),
    winRate,
    wins,
    losses,
    breakevens,
    biggestWin: wins > 0 ? { symbol: biggestWinSymbol, pnl: r2(biggestWinPnl) } : null,
    biggestLoss: losses > 0 ? { symbol: biggestLossSymbol, pnl: r2(biggestLossPnl) } : null,
    bestSymbol,
    bestStrategy,
    worstStrategy,
    averagePnl: r2(netPnl / trades.length),
    tradingDays: daySet.size,
    currentStreak: { type: streakType, count: streakCount },
  };
}
