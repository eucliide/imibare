const r2 = (n: number) => Math.round(n * 100) / 100;

export type SetupTrade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  riskReward: string | null;
  closedAt: Date;
  setupId: string | null;
};

export type SetupStats = {
  setupId: string;
  setupName: string;
  rules: string;
  totalTrades: number;
  netPnl: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  averageRiskReward: number | null;
  expectancy: number;
  expectancyProvisional: boolean;
  bestTrade: { symbol: string; pnl: number } | null;
  worstTrade: { symbol: string; pnl: number } | null;
  firstTradeAt: Date | null;
  lastTradeAt: Date | null;
  currentStreak: { type: "win" | "loss" | null; count: number };
  distinctDays: number;
  longestWinStreak: number;
};

export function computeSetupStats(
  setup: { id: string; name: string; rules: string },
  trades: SetupTrade[]
): SetupStats {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  if (sorted.length === 0) {
    return {
      setupId: setup.id,
      setupName: setup.name,
      rules: setup.rules,
      totalTrades: 0,
      netPnl: 0,
      wins: 0,
      losses: 0,
      breakevens: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      averageRiskReward: null,
      expectancy: 0,
      expectancyProvisional: false,
      bestTrade: null,
      worstTrade: null,
      firstTradeAt: null,
      lastTradeAt: null,
      currentStreak: { type: null, count: 0 },
      distinctDays: 0,
      longestWinStreak: 0,
    };
  }

  let netPnl = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;
  let bestPnl = -Infinity;
  let worstPnl = Infinity;
  let bestTrade: SetupStats["bestTrade"] = null;
  let worstTrade: SetupStats["worstTrade"] = null;
  const rrValues: number[] = [];
  const days = new Set<string>();

  for (const t of sorted) {
    const pnl = parseFloat(t.netPnl);
    netPnl += pnl;
    days.add(new Date(t.closedAt).toISOString().split("T")[0]);

    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += Math.abs(pnl);
    } else {
      breakevens++;
    }

    if (pnl > bestPnl) {
      bestPnl = pnl;
      bestTrade = { symbol: t.symbol, pnl: r2(pnl) };
    }
    if (pnl < worstPnl) {
      worstPnl = pnl;
      worstTrade = { symbol: t.symbol, pnl: r2(pnl) };
    }

    if (t.riskReward !== null && t.riskReward !== undefined) {
      const rr = parseFloat(t.riskReward);
      if (!isNaN(rr)) rrValues.push(rr);
    }
  }

  const decided = wins + losses;
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const averageWin = wins > 0 ? r2(grossProfit / wins) : 0;
  const averageLoss = losses > 0 ? r2(grossLoss / losses) : 0;
  const averageRiskReward =
    rrValues.length > 0
      ? r2(rrValues.reduce((a, b) => a + b, 0) / rrValues.length)
      : null;

  // Expectancy: (wr * avgWin) - ((1-wr) * avgLoss)
  const wr = winRate / 100;
  const expectancy = r2(wr * averageWin - (1 - wr) * averageLoss);
  // Provisional when no losses yet (can't compute true expectancy)
  const expectancyProvisional = losses === 0 && wins > 0;

  // Current streak
  let currentStreak: SetupStats["currentStreak"] = { type: null, count: 0 };
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const lastType =
      parseFloat(last.netPnl) > 0
        ? "win"
        : parseFloat(last.netPnl) < 0
        ? "loss"
        : null;
    if (lastType) {
      let count = 0;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const pnl = parseFloat(sorted[i].netPnl);
        const type = pnl > 0 ? "win" : pnl < 0 ? "loss" : null;
        if (type === lastType) count++;
        else break;
      }
      currentStreak = { type: lastType, count };
    }
  }

  // Longest win streak
  let longestWinStreak = 0;
  let streak = 0;
  for (const t of sorted) {
    if (parseFloat(t.netPnl) > 0) {
      streak++;
      if (streak > longestWinStreak) longestWinStreak = streak;
    } else {
      streak = 0;
    }
  }

  return {
    setupId: setup.id,
    setupName: setup.name,
    rules: setup.rules,
    totalTrades: sorted.length,
    netPnl: r2(netPnl),
    wins,
    losses,
    breakevens,
    winRate: Math.round(winRate * 10) / 10,
    profitFactor: Math.round(profitFactor * 100) / 100,
    averageWin,
    averageLoss,
    averageRiskReward,
    expectancy,
    expectancyProvisional,
    bestTrade,
    worstTrade,
    firstTradeAt: sorted[0].closedAt,
    lastTradeAt: sorted[sorted.length - 1].closedAt,
    currentStreak,
    distinctDays: days.size,
    longestWinStreak,
  };
}

export function computeSetupEquityCurve(
  trades: SetupTrade[]
): { date: string; pnl: number }[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );
  let running = 0;
  return sorted.map((t) => {
    running = r2(running + parseFloat(t.netPnl));
    return {
      date: new Date(t.closedAt).toISOString().split("T")[0],
      pnl: running,
    };
  });
}

export type RankMetric =
  | "netPnl"
  | "winRate"
  | "profitFactor"
  | "expectancy"
  | "totalTrades";

export function rankSetupsBy(
  setups: SetupStats[],
  metric: RankMetric
): SetupStats[] {
  return setups
    .filter((s) => s.totalTrades > 0)
    .sort((a, b) => b[metric] - a[metric]);
}
