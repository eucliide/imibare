// src/lib/accounts.ts

type Trade = { netPnl: string; closedAt: Date };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function getAccountBalance(startingBalance: number, trades: Trade[]): number {
  const sum = trades.reduce((acc, t) => acc + parseFloat(t.netPnl), 0);
  return r2(startingBalance + sum);
}

export function buildEquitySeriesByDay(
  startingBalance: number,
  trades: Trade[]
): { date: string; equity: number }[] {
  if (trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  // Aggregate pnl per UTC day
  const dayMap = new Map<string, number>();
  for (const t of sorted) {
    const day = new Date(t.closedAt).toISOString().split("T")[0];
    dayMap.set(day, (dayMap.get(day) ?? 0) + parseFloat(t.netPnl));
  }

  const days = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  let running = startingBalance;
  return days.map(([date, pnl]) => {
    running = r2(running + pnl);
    return { date, equity: running };
  });
}

export function getAccountDrawdownSeries(
  startingBalance: number,
  trades: Trade[]
): { date: string; drawdown: number }[] {
  const series = buildEquitySeriesByDay(startingBalance, trades);
  let peak = startingBalance;
  return series.map(({ date, equity }) => {
    if (equity > peak) peak = equity;
    return { date, drawdown: r2(equity - peak) };
  });
}
