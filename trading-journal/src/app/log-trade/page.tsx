import { db } from "@/db";
import { accounts, playbookSetups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LogTradeForm } from "./log-trade-form";

export const dynamic = "force-dynamic";

export default async function LogTradePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const [allAccounts, allSetups] = await Promise.all([
    db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .orderBy(accounts.createdAt),
    db
      .select({ id: playbookSetups.id, name: playbookSetups.name })
      .from(playbookSetups)
      .where(eq(playbookSetups.userId, user.id))
      .orderBy(playbookSetups.name),
  ]);

  const nonArchivedAccounts = allAccounts
    .filter((a) => !a.isArchived)
    .map((a) => ({ id: a.id, name: a.name }));

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-3xl">
        <LogTradeForm
          accounts={nonArchivedAccounts}
          setups={allSetups}
          defaultAccountId={params.account ?? null}
        />
      </div>
    </main>
  );
}
