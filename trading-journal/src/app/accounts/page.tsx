import { db } from "@/db";
import { accounts, trades, certificates, payouts, expenses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, isNull, isNotNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAccountBalance } from "@/lib/accounts";
import { AccountsClient } from "./accounts-client";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.createdAt);

  const userTrades = await db
    .select({ accountId: trades.accountId, netPnl: trades.netPnl })
    .from(trades)
    .where(and(eq(trades.userId, user.id), isNull(trades.deletedAt)));

  // Certificate counts per account
  const certRows = await db
    .select({
      accountId: certificates.accountId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(certificates)
    .where(eq(certificates.userId, user.id))
    .groupBy(certificates.accountId);

  const certCountMap = new Map<string, number>(
    certRows.map((r) => [r.accountId, r.count])
  );

  // Net payout totals per account
  const payoutRows = await db
    .select({
      accountId: payouts.accountId,
      totalNet: sql<number>`cast(sum(cast(amount as numeric) - cast(fee as numeric)) as float)`,
    })
    .from(payouts)
    .where(eq(payouts.userId, user.id))
    .groupBy(payouts.accountId);

  const payoutNetMap = new Map<string, number>(
    payoutRows.map((r) => [r.accountId, Math.round((r.totalNet ?? 0) * 100) / 100])
  );

  // Expense totals per account (only linked expenses)
  const expenseRows = await db
    .select({
      accountId: expenses.accountId,
      totalSpend: sql<number>`cast(sum(cast(amount as numeric)) as float)`,
    })
    .from(expenses)
    .where(and(eq(expenses.userId, user.id), isNotNull(expenses.accountId)))
    .groupBy(expenses.accountId);

  const expenseSpendMap = new Map<string, number>(
    expenseRows
      .filter((r) => r.accountId !== null)
      .map((r) => [r.accountId as string, Math.round((r.totalSpend ?? 0) * 100) / 100])
  );

  const accountsWithBalance = userAccounts.map((account) => {
    const accountTrades = userTrades.filter((t) => t.accountId === account.id);
    const currentBalance = getAccountBalance(
      parseFloat(account.startingBalance),
      accountTrades.map((t) => ({ netPnl: t.netPnl, closedAt: new Date() }))
    );
    return {
      ...account,
      currentBalance,
      tradeCount: accountTrades.length,
      certCount: certCountMap.get(account.id) ?? 0,
      payoutNet: payoutNetMap.get(account.id) ?? 0,
      expenseSpend: expenseSpendMap.get(account.id) ?? 0,
    };
  });

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <AccountsClient accounts={accountsWithBalance} />
      </div>
    </main>
  );
}
