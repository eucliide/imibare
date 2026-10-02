// src/lib/real-net.ts
// Shared helper so /expenses and /payouts compute the same value from the same queries.

import { db } from "@/db";
import { payouts, expenses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function getRealNetProfit(
  userId: string
): Promise<{ payoutsNet: number; expensesTotal: number; net: number }> {
  const [payoutRow] = await db
    .select({
      total: sql<number>`cast(coalesce(sum(cast(amount as numeric) - cast(fee as numeric)), 0) as float)`,
    })
    .from(payouts)
    .where(eq(payouts.userId, userId))
    .limit(1);

  const [expenseRow] = await db
    .select({
      total: sql<number>`cast(coalesce(sum(cast(amount as numeric)), 0) as float)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .limit(1);

  const payoutsNet = r2(payoutRow?.total ?? 0);
  const expensesTotal = r2(expenseRow?.total ?? 0);
  return { payoutsNet, expensesTotal, net: r2(payoutsNet - expensesTotal) };
}
