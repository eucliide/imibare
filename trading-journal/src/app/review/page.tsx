import { db } from "@/db";
import { trades, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { computeWeeklyStats } from "@/lib/weekly-stats";
import {
  getWeekStart,
  getWeekEnd,
  getWeekOffset,
  weekToParam,
  paramToWeekStart,
  isCurrentWeek,
  getIsoWeekNumber,
  formatWeekRange,
} from "@/lib/week";
import { buildDailyPnlMap } from "@/lib/analytics";
import { generateWeeklyNarrative } from "@/lib/narrative";
import { and, between, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getWeeklyReview } from "./actions";
import { WeeklyReviewClient } from "./weekly-review-client";
import { AccountSwitcher } from "@/components/account-switcher";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; account?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const weekStart = params.week
    ? (paramToWeekStart(params.week) ?? getWeekStart(new Date()))
    : getWeekStart(new Date());

  const weekEnd = getWeekEnd(weekStart);
  const prevWeekStart = getWeekOffset(weekStart, -1);
  const prevWeekEnd = getWeekEnd(prevWeekStart);

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.createdAt);

  const activeAccounts = userAccounts.filter((a) => !a.isArchived);

  const baseWhere = and(
    eq(trades.userId, user.id),
    between(trades.closedAt, weekStart, weekEnd)
  );
  const whereClause = params.account
    ? and(baseWhere, eq(trades.accountId, params.account))
    : baseWhere;

  const prevBaseWhere = and(
    eq(trades.userId, user.id),
    between(trades.closedAt, prevWeekStart, prevWeekEnd)
  );
  const prevWhereClause = params.account
    ? and(prevBaseWhere, eq(trades.accountId, params.account))
    : prevBaseWhere;

  const [weekTrades, prevTrades] = await Promise.all([
    db.select().from(trades).where(whereClause),
    db.select().from(trades).where(prevWhereClause),
  ]);

  const stats = computeWeeklyStats(weekTrades);
  const prevStats = computeWeeklyStats(prevTrades);
  const dailyPnl = buildDailyPnlMap(weekTrades);
  const narrative = generateWeeklyNarrative(stats, prevStats);

  const weekParam = weekToParam(weekStart);
  const existingReview = await getWeeklyReview(weekParam);

  const prevWeekParam = weekToParam(prevWeekStart);
  const nextWeekParam = weekToParam(getWeekOffset(weekStart, 1));
  const onCurrentWeek = isCurrentWeek(weekStart);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        {activeAccounts.length > 0 && (
          <div className="mb-6">
            <AccountSwitcher accounts={activeAccounts} />
          </div>
        )}
        <WeeklyReviewClient
          weekParam={weekParam}
          weekStart={weekStart.toISOString()}
          weekNumber={getIsoWeekNumber(weekStart)}
          weekYear={weekStart.getUTCFullYear()}
          weekRangeLabel={formatWeekRange(weekStart)}
          stats={stats}
          dailyPnl={dailyPnl}
          narrative={narrative}
          savedNotes={existingReview?.notes ?? ""}
          savedMood={
            (existingReview?.mood as
              | "confident"
              | "neutral"
              | "frustrated"
              | "disciplined"
              | null) ?? null
          }
          savedDiscipline={existingReview?.discipline ?? null}
          savedFocus={existingReview?.focus ?? null}
          savedPatience={existingReview?.patience ?? null}
          savedWinsOfWeek={existingReview?.winsOfWeek ?? ""}
          savedImproveNext={existingReview?.improveNext ?? ""}
          prevWeekParam={prevWeekParam}
          nextWeekParam={nextWeekParam}
          isCurrentWeek={onCurrentWeek}
        />
      </div>
    </main>
  );
}
