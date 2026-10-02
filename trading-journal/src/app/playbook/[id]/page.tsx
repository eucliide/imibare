import { db } from "@/db";
import { playbookSetups, trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { computeSetupStats, computeSetupEquityCurve } from "@/lib/playbook-stats";
import { SetupDeepDive } from "./setup-deep-dive";

export const dynamic = "force-dynamic";

export default async function SetupDeepDivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const [setup] = await db
    .select()
    .from(playbookSetups)
    .where(and(eq(playbookSetups.id, id), eq(playbookSetups.userId, user.id)))
    .limit(1);

  if (!setup) notFound();

  const setupTrades = await db
    .select()
    .from(trades)
    .where(and(eq(trades.setupId, id), eq(trades.userId, user.id), isNull(trades.deletedAt)))
    .orderBy(trades.closedAt);

  // Untagged trades for bulk-link (cap 50)
  const untaggedTrades = await db
    .select({
      id: trades.id,
      symbol: trades.symbol,
      outcome: trades.outcome,
      netPnl: trades.netPnl,
      closedAt: trades.closedAt,
    })
    .from(trades)
    .where(and(eq(trades.userId, user.id), isNull(trades.setupId), isNull(trades.deletedAt)))
    .orderBy(trades.closedAt)
    .limit(50);

  const stats = computeSetupStats(setup, setupTrades);
  const equityCurve = computeSetupEquityCurve(setupTrades);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <SetupDeepDive
          setup={setup}
          stats={stats}
          equityCurve={equityCurve}
          trades={setupTrades}
          untaggedTrades={untaggedTrades}
        />
      </div>
    </main>
  );
}
