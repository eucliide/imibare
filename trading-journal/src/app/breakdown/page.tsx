import { db } from "@/db";
import { trades } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  groupBySymbol,
  groupByStrategy,
  groupByDirection,
  groupByDayOfWeek,
  groupBySession,
} from "@/lib/breakdown";
import { BreakdownTable } from "@/components/breakdown-table";

export const dynamic = "force-dynamic";

export default async function BreakdownPage() {
  const allTrades = await db.select().from(trades).orderBy(desc(trades.closedAt));

  const bySymbol = groupBySymbol(allTrades);
  const byStrategy = groupByStrategy(allTrades);
  const byDirection = groupByDirection(allTrades);
  const byDay = groupByDayOfWeek(allTrades);
  const bySession = groupBySession(allTrades);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-white">Breakdown</h1>
          <p className="mt-2 text-[var(--muted)]">
            Where does your edge actually live?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BreakdownTable title="By Symbol" rows={bySymbol} index={0} />
          <BreakdownTable title="By Strategy" rows={byStrategy} index={1} />
          <BreakdownTable title="By Direction" rows={byDirection} index={2} />
          <BreakdownTable title="By Session" rows={bySession} index={3} />
          <div className="md:col-span-2">
            <BreakdownTable title="By Day of Week" rows={byDay} index={4} />
          </div>
        </div>
      </div>
    </main>
  );
}