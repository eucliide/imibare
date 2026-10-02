// src/lib/payouts.ts

// Multi-currency conversion is out of scope for v1;
// all totals assume the payout's currency matches the account's.

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Payout = {
  id: string;
  amount: string;
  fee: string;
  currency: string;
  method: string | null;
  receivedAt: Date;
};

export type PayoutStats = {
  count: number;
  totalGross: number;
  totalFees: number;
  totalNet: number;
  averageNet: number;
  latest: Payout | null;
  byMethod: { method: string; count: number; net: number }[];
  byMonth: { month: string; net: number }[];
};

export function computePayoutStats(payouts: Payout[]): PayoutStats {
  if (payouts.length === 0) {
    return {
      count: 0,
      totalGross: 0,
      totalFees: 0,
      totalNet: 0,
      averageNet: 0,
      latest: null,
      byMethod: [],
      byMonth: [],
    };
  }

  let totalGross = 0;
  let totalFees = 0;
  const methodMap = new Map<string, { count: number; net: number }>();
  const monthMap = new Map<string, number>();

  const sorted = [...payouts].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
  );

  for (const p of sorted) {
    const gross = parseFloat(p.amount);
    const fee = parseFloat(p.fee);
    const net = r2(gross - fee);
    totalGross = r2(totalGross + gross);
    totalFees = r2(totalFees + fee);

    const method = p.method ?? "other";
    const existing = methodMap.get(method) ?? { count: 0, net: 0 };
    existing.count++;
    existing.net = r2(existing.net + net);
    methodMap.set(method, existing);

    const month = new Date(p.receivedAt).toISOString().slice(0, 7);
    monthMap.set(month, r2((monthMap.get(month) ?? 0) + net));
  }

  const totalNet = r2(totalGross - totalFees);
  const averageNet = r2(totalNet / payouts.length);

  const latest = sorted.at(-1) ?? null;

  const byMethod = Array.from(methodMap.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.net - a.net);

  const byMonth = Array.from(monthMap.entries())
    .map(([month, net]) => ({ month, net }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { count: payouts.length, totalGross, totalFees, totalNet, averageNet, latest, byMethod, byMonth };
}

export type PayoutSeriesPoint = { date: string; cumulative: number };

export function buildPayoutSeries(payouts: Payout[]): PayoutSeriesPoint[] {
  const sorted = [...payouts].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
  );
  let running = 0;
  return sorted.map((p) => {
    running = r2(running + parseFloat(p.amount) - parseFloat(p.fee));
    return {
      date: new Date(p.receivedAt).toISOString().split("T")[0],
      cumulative: running,
    };
  });
}
