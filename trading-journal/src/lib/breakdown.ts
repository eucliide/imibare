import type { Trade } from "./analytics";

export type GroupedStats = {
  label: string;
  trades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  averagePnl: number;
};

function computeGroup(trades: Trade[], label: string): GroupedStats {
  let netPnl = 0;
  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  for (const t of trades) {
    const pnl = parseFloat(t.netPnl);
    netPnl += pnl;
    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += Math.abs(pnl);
    }
  }

  const decided = wins + losses;
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  return {
    label,
    trades: trades.length,
    netPnl,
    winRate,
    profitFactor,
    averagePnl: trades.length > 0 ? netPnl / trades.length : 0,
  };
}

export function groupBySymbol(trades: Trade[]): GroupedStats[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    if (!map.has(t.symbol)) map.set(t.symbol, []);
    map.get(t.symbol)!.push(t);
  }
  return Array.from(map.entries())
    .map(([symbol, ts]) => computeGroup(ts, symbol))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function groupByStrategy(trades: Trade[]): GroupedStats[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const key = t.strategy || "UNTAGGED";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries())
    .map(([strategy, ts]) => computeGroup(ts, strategy))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function groupByDirection(trades: Trade[]): GroupedStats[] {
  return ["LONG", "SHORT"]
    .map((dir) => {
      const filtered = trades.filter((t) => t.direction === dir);
      return computeGroup(filtered, dir);
    })
    .filter((g) => g.trades > 0);
}

export function groupByDayOfWeek(trades: Trade[]): GroupedStats[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map = new Map<number, Trade[]>();
  for (const t of trades) {
    const d = new Date(t.closedAt).getDay();
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(t);
  }
  return Array.from(map.entries())
    .map(([day, ts]) => computeGroup(ts, days[day]))
    .sort((a, b) => days.indexOf(a.label) - days.indexOf(b.label));
}

export function groupBySession(trades: Trade[]): GroupedStats[] {
  // Approximate session by UTC hour
  // Asia: 00:00–07:59 UTC
  // London: 08:00–12:59 UTC
  // NY: 13:00–21:59 UTC
  const sessions = { ASIA: [] as Trade[], LONDON: [] as Trade[], NY: [] as Trade[] };
  for (const t of trades) {
    const hour = new Date(t.closedAt).getUTCHours();
    if (hour < 8) sessions.ASIA.push(t);
    else if (hour < 13) sessions.LONDON.push(t);
    else sessions.NY.push(t);
  }
  return Object.entries(sessions)
    .filter(([, ts]) => ts.length > 0)
    .map(([name, ts]) => computeGroup(ts, name));
}