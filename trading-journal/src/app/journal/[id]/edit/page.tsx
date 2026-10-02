import { db } from "@/db";
import { accounts, playbookSetups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getTrade } from "../../actions";
import { EditTradeForm } from "./edit-trade-form";

export const dynamic = "force-dynamic";

export default async function EditTradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const trade = await getTrade(id);
  if (!trade) notFound();

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
        <EditTradeForm
          trade={trade}
          accounts={nonArchivedAccounts}
          setups={allSetups}
        />
      </div>
    </main>
  );
}
