// src/lib/expenses.ts
// Multi-currency conversion is out of scope for v1; all totals assume USD-like consistency.

import { EXPENSE_CATEGORIES, getCategoryLabel } from "./expense-categories";

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Expense = {
  id: string;
  amount: string;
  currency: string;
  category: string;
  description: string;
  vendor: string | null;
  spentAt: Date;
  isRecurring: boolean;
  recurrence: string | null;
  notes: string | null;
  accountId: string | null;
};

export type ExpenseStats = {
  total: number;
  count: number;
  ytd: number;
  mtd: number;
  // Recurring monthly cost is a monthly-equivalent estimate, not a stored value.
  // monthly = amount; quarterly = amount / 3; annual = amount / 12.
  recurringMonthly: number;
  topCategory: { value: string; label: string; total: number } | null;
  byCategory: { value: string; label: string; total: number; count: number }[];
  byMonth: { month: string; total: number }[];
};

export function computeExpenseStats(expenses: Expense[]): ExpenseStats {
  if (expenses.length === 0) {
    return {
      total: 0,
      count: 0,
      ytd: 0,
      mtd: 0,
      recurringMonthly: 0,
      topCategory: null,
      byCategory: [],
      byMonth: [],
    };
  }

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  let total = 0;
  let ytd = 0;
  let mtd = 0;
  let recurringMonthly = 0;

  const catMap = new Map<string, { total: number; count: number }>();
  const monthMap = new Map<string, number>();

  for (const e of expenses) {
    const amount = parseFloat(e.amount);
    const d = new Date(e.spentAt);

    total = r2(total + amount);

    if (d.getUTCFullYear() === currentYear) {
      ytd = r2(ytd + amount);
      if (d.getUTCMonth() === currentMonth) {
        mtd = r2(mtd + amount);
      }
    }

    if (e.isRecurring) {
      // Monthly-equivalent estimate: monthly=amount, quarterly=amount/3, annual=amount/12
      const monthly =
        e.recurrence === "quarterly"
          ? amount / 3
          : e.recurrence === "annual"
          ? amount / 12
          : amount;
      recurringMonthly = r2(recurringMonthly + monthly);
    }

    const existing = catMap.get(e.category) ?? { total: 0, count: 0 };
    existing.total = r2(existing.total + amount);
    existing.count++;
    catMap.set(e.category, existing);

    const month = d.toISOString().slice(0, 7);
    monthMap.set(month, r2((monthMap.get(month) ?? 0) + amount));
  }

  const byCategory = Array.from(catMap.entries())
    .map(([value, v]) => ({ value, label: getCategoryLabel(value as never), ...v }))
    .sort((a, b) => b.total - a.total);

  const byMonth = Array.from(monthMap.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topCategory = byCategory[0] ?? null;

  return { total, count: expenses.length, ytd, mtd, recurringMonthly, topCategory, byCategory, byMonth };
}

export type CumulativePoint = { date: string; cumulative: number };

export function buildCumulativeExpenses(expenses: Expense[]): CumulativePoint[] {
  const sorted = [...expenses].sort(
    (a, b) => new Date(a.spentAt).getTime() - new Date(b.spentAt).getTime()
  );
  let running = 0;
  return sorted.map((e) => {
    running = r2(running + parseFloat(e.amount));
    return { date: new Date(e.spentAt).toISOString().split("T")[0], cumulative: running };
  });
}

export function computeRealNetProfit(payoutsNet: number, expensesTotal: number): number {
  return r2(payoutsNet - expensesTotal);
}
