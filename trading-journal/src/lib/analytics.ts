// src/lib/analytics.ts

export type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  strategy: string | null;
  notes: string | null;
  openedAt: Date;
  closedAt: Date;
};

export type TradingMetrics = {
  totalTrades: number;
  netPnl: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number; // 0-100
  profitFactor: number; // gross profit / gross loss
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number; // in dollars, positive number
  recoveryFactor: number; // netPnl / maxDrawdown
  consistency: number; // 0-100 score
  edgeScore: number; // 0-100 weighted composite
};

export function calculateMetrics(trades: Trade[]): TradingMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      netPnl: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
      recoveryFactor: 0,
      consistency: 0,
      edgeScore: 0,
    };
  }

  // Sort chronologically for drawdown and consistency
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  // --- Basic counts ---
  let netPnl = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;

  for (const t of sorted) {
    const pnl = parseFloat(t.netPnl);
    netPnl += pnl;
    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += Math.abs(pnl);
    } else {
      breakevens++;
    }
  }

  // --- Win rate ---
  const decided = wins + losses;
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;

  // --- Profit factor ---
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  // --- Averages ---
  const averageWin = wins > 0 ? grossProfit / wins : 0;
  const averageLoss = losses > 0 ? grossLoss / losses : 0;

  // --- Max drawdown ---
  let peak = 0;
  let runningPnl = 0;
  let maxDrawdown = 0;
  for (const t of sorted) {
    runningPnl += parseFloat(t.netPnl);
    if (runningPnl > peak) peak = runningPnl;
    const drawdown = peak - runningPnl;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // --- Recovery factor ---
  const recoveryFactor = maxDrawdown > 0 ? netPnl / maxDrawdown : netPnl > 0 ? 999 : 0;

  // --- Consistency (0-100) ---
  // Based on the standard deviation of returns relative to the mean.
  // A trader with consistent returns gets a high score.
  const consistency = calculateConsistency(sorted);

  // --- Edge Score (0-100) ---
  // Weighted composite. Weights based on what matters most for funded traders:
  //   - Consistency (30%): Can we rely on you?
  //   - Profit Factor (25%): Are your winners bigger than your losers?
  //   - Win Rate (20%): Do you win more than you lose?
  //   - Average Win/Loss Ratio (15%): Reward-to-risk profile.
  //   - Recovery Factor (10%): How fast do you bounce back?
  const avgWinLossRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 5 : 0;

  const consistencyScore = consistency; // already 0-100
  const pfScore = Math.min(profitFactor / 3, 1) * 100; // 3.0+ = perfect
  const wrScore = winRate; // already 0-100
  const awlScore = Math.min(avgWinLossRatio / 3, 1) * 100; // 3.0+ = perfect
  const rfScore = Math.min(recoveryFactor / 5, 1) * 100; // 5.0+ = perfect

  const edgeScore =
    consistencyScore * 0.30 +
    pfScore * 0.25 +
    wrScore * 0.20 +
    awlScore * 0.15 +
    rfScore * 0.10;

  return {
    totalTrades: trades.length,
    netPnl,
    wins,
    losses,
    breakevens,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    maxDrawdown,
    recoveryFactor,
    consistency,
    edgeScore: Math.round(edgeScore * 10) / 10,
  };
}

function calculateConsistency(sortedTrades: Trade[]): number {
  if (sortedTrades.length < 3) return 50; // not enough data, default mid

  const returns = sortedTrades.map((t) => parseFloat(t.netPnl));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation: stdDev / |mean|
  // Lower is better (more consistent)
  if (mean === 0) return 0;
  const cv = stdDev / Math.abs(mean);

  // Map cv to 0-100. cv of 0 = perfect (100). cv of 2+ = terrible (0).
  const score = Math.max(0, Math.min(100, (1 - cv / 2) * 100));
  return Math.round(score * 10) / 10;
}

// --- Cumulative P&L series for the area chart ---
export function buildCumulativeSeries(trades: Trade[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  let running = 0;
  return sorted.map((t) => {
    running += parseFloat(t.netPnl);
    return {
      date: new Date(t.closedAt).toISOString().split("T")[0],
      pnl: Math.round(running * 100) / 100,
    };
  });
}

// --- Daily P&L map for the calendar ---
export function buildDailyPnlMap(trades: Trade[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of trades) {
    const day = new Date(t.closedAt).toISOString().split("T")[0];
    map[day] = (map[day] || 0) + parseFloat(t.netPnl);
  }
  return map;
}