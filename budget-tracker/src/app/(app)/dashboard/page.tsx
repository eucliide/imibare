import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { accounts, categories, transactions, recurringBills, savingsGoals } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { MetricCard } from "@/components/metric-card";
import { EmptyState } from "@/components/empty-state";
import { startOfMonth, endOfMonth } from "date-fns";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [userAccounts, userCategories, monthTransactions, upcomingBills, activeGoals] =
    await Promise.all([
      db.query.accounts.findMany({ where: eq(accounts.userId, user.id) }),
      db.query.categories.findMany({ where: eq(categories.userId, user.id) }),
      db.query.transactions.findMany({
        where: and(
          eq(transactions.userId, user.id),
          gte(transactions.occurredAt, monthStart),
          lte(transactions.occurredAt, monthEnd)
        ),
      }),
      db.query.recurringBills.findMany({
        where: and(eq(recurringBills.userId, user.id), eq(recurringBills.isActive, true)),
        limit: 5,
        orderBy: [desc(recurringBills.amount)],
      }),
      db.query.savingsGoals.findMany({
        where: and(eq(savingsGoals.userId, user.id), eq(savingsGoals.isArchived, false)),
        limit: 3,
        orderBy: [desc(savingsGoals.targetAmount)],
      }),
    ]);

  const totalBalance = userAccounts.reduce(
    (sum, acc) => sum + Number(acc.startingBalance),
    0
  );

  const monthIncome = monthTransactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpenses = monthTransactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Your financial overview for {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Balance" value={`$${totalBalance.toFixed(2)}`} index={0} />
        <MetricCard label="Month Income" value={`$${monthIncome.toFixed(2)}`} accent="emerald" index={1} />
        <MetricCard label="Month Expenses" value={`$${monthExpenses.toFixed(2)}`} accent="rose" index={2} />
        <MetricCard label="Net Cash Flow" value={`$${(monthIncome - monthExpenses).toFixed(2)}`} accent={monthIncome >= monthExpenses ? "emerald" : "rose"} index={3} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Bills</h2>
        {upcomingBills.length === 0 ? (
          <EmptyState
            title="No recurring bills"
            description="Add your first recurring bill to track upcoming payments"
            action={{ label: "Add Bill", href: "/bills" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBills.map((bill) => {
              const category = userCategories.find((c) => c.id === bill.categoryId);
              return (
                <div key={bill.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{bill.name}</h3>
                    <span className="text-sm text-zinc-400">{bill.frequency}</span>
                  </div>
                  <p className="text-2xl font-bold">${Number(bill.amount).toFixed(2)}</p>
                  {category && <p className="text-sm text-zinc-400">{category.name}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Savings Goals</h2>
        {activeGoals.length === 0 ? (
          <EmptyState
            title="No savings goals"
            description="Set your first savings goal to start tracking your progress"
            action={{ label: "Add Goal", href: "/goals" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => {
              const progress =
                Number(goal.targetAmount) > 0
                  ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                  : 0;
              return (
                <div key={goal.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                  <h3 className="font-medium">{goal.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">${Number(goal.currentAmount).toFixed(2)}</span>
                      <span className="font-medium">${Number(goal.targetAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
