// src/lib/benchmark.ts
// Pure functions — no DB, no side effects.

export type EquityPoint = { date: string; equity: number };
export type PricePoint = { date: string; close: number };

const r2 = (n: number) => Math.round(n * 100) / 100;

// ─── Benchmark builders ───────────────────────────────────────────────────────

/** Flat line — equity never changes from startingEquity */
export function buildFlatBenchmark(
  startingEquity: number,
  series: EquityPoint[]
): EquityPoint[] {
  return series.map(({ date }) => ({ date, equity: startingEquity }));
}

/** Compounds at the equivalent daily rate of annualTargetPct */
export function buildCustomBenchmark(
  startingEquity: number,
  annualTargetPct: number,
  series: EquityPoint[]
): EquityPoint[] {
  if (series.length === 0) return [];
  const dailyRate = Math.pow(1 + annualTargetPct / 100, 1 / 365) - 1;
  const t0 = new Date(series[0].date).getTime();
  return series.map(({ date }) => {
    const days = (new Date(date).getTime() - t0) / 86_400_000;
    return { date, equity: r2(startingEquity * Math.pow(1 + dailyRate, days)) };
  });
}

/**
 * Rebases index prices so the first available close = startingEquity,
 * then maps each point in the trader's series to the closest preceding close.
 */
export function buildIndexBenchmark(
  startingEquity: number,
  prices: PricePoint[],
  series: EquityPoint[]
): EquityPoint[] {
  if (series.length === 0 || prices.length === 0) return [];

  const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));

  // Find the base close: the closest price on or before the first series date
  const firstDate = series[0].date;
  const basePrice = sorted.findLast((p) => p.date <= firstDate) ?? sorted[0];
  const scale = startingEquity / basePrice.close;

  return series.map(({ date }) => {
    const p = sorted.findLast((p) => p.date <= date) ?? sorted[0];
    return { date, equity: r2(p.close * scale) };
  });
}

export type BenchmarkKind = "flat" | "custom" | "index";

export function normalizeBenchmark(
  kind: BenchmarkKind,
  startingEquity: number,
  series: EquityPoint[],
  opts: { annualTargetPct?: number; prices?: PricePoint[] } = {}
): EquityPoint[] {
  if (kind === "flat") return buildFlatBenchmark(startingEquity, series);
  if (kind === "custom")
    return buildCustomBenchmark(startingEquity, opts.annualTargetPct ?? 20, series);
  if (kind === "index")
    return buildIndexBenchmark(startingEquity, opts.prices ?? [], series);
  return [];
}

// ─── Risk-adjusted metrics ────────────────────────────────────────────────────

export type RiskMetrics = {
  sharpe: number;
  sortino: number;
  calmar: number;
  consistencyScore: number; // 0-100
};

/**
 * Computes Sharpe, Sortino, Calmar, and Consistency Score from a daily equity series.
 * riskFreeAnnual: annualised risk-free rate as a decimal (e.g. 0.05 for 5%).
 */
export function computeRiskMetrics(
  series: EquityPoint[],
  maxDrawdownDollars: number,
  riskFreeAnnual = 0.05
): RiskMetrics {
  if (series.length < 2) {
    return { sharpe: 0, sortino: 0, calmar: 0, consistencyScore: 0 };
  }

  // Daily returns from equity series
  const dailyReturns: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].equity;
    const curr = series[i].equity;
    if (prev > 0) dailyReturns.push((curr - prev) / prev);
  }

  if (dailyReturns.length === 0)
    return { sharpe: 0, sortino: 0, calmar: 0, consistencyScore: 0 };

  const n = dailyReturns.length;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / n;
  const variance = dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Annualise (252 trading days)
  const annualReturn = mean * 252;
  const annualStdDev = stdDev * Math.sqrt(252);
  const rfDaily = riskFreeAnnual / 252;

  // Sharpe
  const sharpe =
    annualStdDev > 0
      ? r2((annualReturn - riskFreeAnnual) / annualStdDev)
      : 0;

  // Sortino — downside deviation only
  const downsideReturns = dailyReturns.filter((r) => r < rfDaily);
  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((a, b) => a + (b - rfDaily) ** 2, 0) /
        downsideReturns.length
      : 0;
  const downsideStdDev = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortino =
    downsideStdDev > 0
      ? r2((annualReturn - riskFreeAnnual) / downsideStdDev)
      : annualReturn > 0
      ? 99
      : 0;

  // Calmar — annualised return / max drawdown %
  const startEquity = series[0].equity;
  const maxDrawdownPct =
    startEquity > 0 ? maxDrawdownDollars / startEquity : 0;
  const calmar =
    maxDrawdownPct > 0 ? r2(annualReturn / maxDrawdownPct) : annualReturn > 0 ? 99 : 0;

  // Consistency Score (0-100): penalises high coefficient of variation
  const cv = mean !== 0 ? stdDev / Math.abs(mean) : 2;
  const consistencyScore = Math.round(Math.max(0, Math.min(100, (1 - cv / 2) * 100)) * 10) / 10;

  return { sharpe, sortino, calmar, consistencyScore };
}

// ─── Rolling metrics ──────────────────────────────────────────────────────────

export type RollingPoint = { date: string; pnl: number; winRate: number };

/**
 * Builds a rolling window of P&L sum and win rate.
 * Input trades must be sorted chronologically.
 */
export function buildRollingMetrics(
  trades: { closedAt: Date; netPnl: string; outcome: string }[],
  windowDays = 30
): RollingPoint[] {
  if (trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  return sorted.map((_, i) => {
    const anchor = new Date(sorted[i].closedAt).getTime();
    const cutoff = anchor - windowDays * 86_400_000;
    const window = sorted.slice(0, i + 1).filter(
      (t) => new Date(t.closedAt).getTime() >= cutoff
    );
    const pnl = r2(window.reduce((a, t) => a + parseFloat(t.netPnl), 0));
    const wins = window.filter((t) => t.outcome === "WIN").length;
    const decided = window.filter((t) => t.outcome !== "BREAKEVEN").length;
    const winRate = decided > 0 ? Math.round((wins / decided) * 1000) / 10 : 0;
    return {
      date: new Date(sorted[i].closedAt).toISOString().split("T")[0],
      pnl,
      winRate,
    };
  });
}

// ─── Monthly returns table ────────────────────────────────────────────────────

export type MonthlyReturns = {
  year: number;
  months: (number | null)[]; // index 0=Jan … 11=Dec, value = % return or null
  annual: number | null;
};

export function buildMonthlyReturns(
  series: EquityPoint[],
  startingEquity: number
): MonthlyReturns[] {
  if (series.length === 0) return [];

  // Build a map: "YYYY-MM" → last equity of that month
  const monthMap = new Map<string, number>();
  for (const { date, equity } of series) {
    const key = date.slice(0, 7); // "YYYY-MM"
    monthMap.set(key, equity); // last entry per month wins (series is sorted)
  }

  // Collect all years
  const years = Array.from(
    new Set(Array.from(monthMap.keys()).map((k) => parseInt(k.slice(0, 4))))
  ).sort();

  return years.map((year) => {
    const months: (number | null)[] = Array(12).fill(null);
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      const curr = monthMap.get(key);
      if (curr === undefined) continue;

      // Previous equity: end of prior month, or startingEquity for Jan of first year
      let prev: number | undefined;
      if (m === 0) {
        const prevKey = `${year - 1}-12`;
        prev = monthMap.get(prevKey) ?? (year === years[0] ? startingEquity : undefined);
      } else {
        const prevKey = `${year}-${String(m).padStart(2, "0")}`;
        prev = monthMap.get(prevKey);
        if (prev === undefined && m === 1) prev = startingEquity; // fallback for Feb if Jan missing
      }

      if (prev !== undefined && prev > 0) {
        months[m] = Math.round(((curr - prev) / prev) * 10000) / 100;
      }
    }

    // Annual return: first available equity of year vs last
    const firstKey = Array.from(monthMap.keys())
      .filter((k) => k.startsWith(`${year}-`))
      .sort()[0];
    const lastKey = Array.from(monthMap.keys())
      .filter((k) => k.startsWith(`${year}-`))
      .sort()
      .at(-1);

    let annual: number | null = null;
    if (firstKey && lastKey) {
      const startVal =
        year === years[0]
          ? startingEquity
          : (() => {
              const prevYearKey = `${year - 1}-12`;
              return monthMap.get(prevYearKey) ?? startingEquity;
            })();
      const endVal = monthMap.get(lastKey)!;
      if (startVal > 0) {
        annual = Math.round(((endVal - startVal) / startVal) * 10000) / 100;
      }
    }

    return { year, months, annual };
  });
}
