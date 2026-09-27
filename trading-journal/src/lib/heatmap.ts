// Sessions by UTC hour
// 0 = ASIA    00:00–07:59
// 1 = LONDON  08:00–12:59
// 2 = NY_AM   13:00–16:59
// 3 = NY_PM   17:00–21:59

export const SESSION_LABELS = ["Asia", "London", "NY AM", "NY PM"] as const;
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type HeatmapCell = {
  day: number;    // 0 = Sun … 6 = Sat
  session: number; // 0–3
  trades: number;
  netPnl: number;
  winRate: number;
};

type Trade = {
  netPnl: string;
  closedAt: Date;
};

function sessionIndex(utcHour: number): number {
  if (utcHour < 8) return 0;
  if (utcHour < 13) return 1;
  if (utcHour < 17) return 2;
  return 3;
}

export function buildHeatmap(trades: Trade[]): HeatmapCell[][] {
  // grid[day][session]
  const wins: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));
  const losses: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));
  const pnl: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));
  const count: number[][] = Array.from({ length: 7 }, () => Array(4).fill(0));

  for (const t of trades) {
    const d = new Date(t.closedAt);
    const day = d.getUTCDay();
    const sess = sessionIndex(d.getUTCHours());
    const p = parseFloat(t.netPnl);
    pnl[day][sess] += p;
    count[day][sess]++;
    if (p > 0) wins[day][sess]++;
    else if (p < 0) losses[day][sess]++;
  }

  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 4 }, (_, sess) => {
      const n = count[day][sess];
      const decided = wins[day][sess] + losses[day][sess];
      return {
        day,
        session: sess,
        trades: n,
        netPnl: Math.round(pnl[day][sess] * 100) / 100,
        winRate: decided > 0 ? Math.round((wins[day][sess] / decided) * 1000) / 10 : 0,
      };
    })
  );
}

export function getHeatmapExtremes(grid: HeatmapCell[][]): {
  max: number;
  min: number;
} {
  let max = 0;
  let min = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.netPnl > max) max = cell.netPnl;
      if (cell.netPnl < min) min = cell.netPnl;
    }
  }
  return { max, min };
}
