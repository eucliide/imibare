import { db } from "@/db";
import { expenses, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { computeExpenseStats, buildCumulativeExpenses } from "@/lib/expenses";
import { getRealNetProfit } from "@/lib/real-net";
import { ExpensesClient } from "./expenses-client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select({ expense: expenses, accountName: accounts.name })
    .from(expenses)
    .leftJoin(accounts, eq(expenses.accountId, accounts.id))
    .where(eq(expenses.userId, user.id))
    .orderBy(desc(expenses.spentAt));

  const allExpenses = rows.map((r) => ({
    ...r.expense,
    accountName: r.accountName ?? null,
  }));

  const activeAccounts = await db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(and(eq(accounts.userId, user.id), eq(accounts.isArchived, false)))
    .orderBy(accounts.name);

  const stats = computeExpenseStats(allExpenses);
  const series = buildCumulativeExpenses(allExpenses);
  const { payoutsNet, net: realNetProfit } = await getRealNetProfit(user.id);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <ExpensesClient
          expenses={allExpenses}
          stats={stats}
          series={series}
          accounts={activeAccounts}
          payoutsNet={payoutsNet}
          realNetProfit={realNetProfit}
        />
      </div>
    </main>
  );
}
