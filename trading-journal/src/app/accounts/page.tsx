import { db } from "@/db";
import { accounts, trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
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
    .where(eq(trades.userId, user.id));

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
