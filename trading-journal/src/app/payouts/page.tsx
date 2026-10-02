import { db } from "@/db";
import { payouts, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { computePayoutStats, buildPayoutSeries } from "@/lib/payouts";
import { PayoutsClient } from "./payouts-client";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.createdAt);

  const rows = await db
    .select({
      payout: payouts,
      accountName: accounts.name,
    })
    .from(payouts)
    .leftJoin(accounts, eq(payouts.accountId, accounts.id))
    .where(eq(payouts.userId, user.id))
    .orderBy(desc(payouts.receivedAt));

  const allPayouts = rows.map((r) => ({
    ...r.payout,
    accountName: r.accountName ?? "Unknown account",
  }));

  const stats = computePayoutStats(allPayouts);
  const series = buildPayoutSeries(allPayouts);

  const nonArchivedAccounts = userAccounts
    .filter((a) => !a.isArchived)
    .map((a) => ({ id: a.id, name: a.name }));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <PayoutsClient
          payouts={allPayouts}
          stats={stats}
          series={series}
          accounts={nonArchivedAccounts}
        />
      </div>
    </main>
  );
}
