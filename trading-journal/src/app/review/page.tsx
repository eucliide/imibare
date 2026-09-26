import { db } from "@/db";
import { trades } from "@/db/schema";
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
import { and, between, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getWeeklyReview } from "./actions";
import { WeeklyReviewClient } from "./weekly-review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  // Resolve the week to display
  const weekStart = params.week
    ? (paramToWeekStart(params.week) ?? getWeekStart(new Date()))
    : getWeekStart(new Date());

  const weekEnd = getWeekEnd(weekStart);

  // Fetch trades for this week scoped to the user
  const weekTrades = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.userId, user.id),
        between(trades.closedAt, weekStart, weekEnd)
      )
    );

  const stats = computeWeeklyStats(weekTrades);
  const dailyPnl = buildDailyPnlMap(weekTrades);

  // Fetch existing review row (may be null)
  const weekParam = weekToParam(weekStart);
  const existingReview = await getWeeklyReview(weekParam);

  const prevWeekParam = weekToParam(getWeekOffset(weekStart, -1));
  const nextWeekParam = weekToParam(getWeekOffset(weekStart, 1));
  const onCurrentWeek = isCurrentWeek(weekStart);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pt-24 md:p-12 md:pt-28">
      <div className="mx-auto max-w-4xl">
        <WeeklyReviewClient
          weekParam={weekParam}
          weekStart={weekStart.toISOString()}
          weekNumber={getIsoWeekNumber(weekStart)}
          weekYear={weekStart.getUTCFullYear()}
          weekRangeLabel={formatWeekRange(weekStart)}
          stats={stats}
          dailyPnl={dailyPnl}
          savedNotes={existingReview?.notes ?? ""}
          savedMood={(existingReview?.mood as "confident" | "neutral" | "frustrated" | "disciplined" | null) ?? null}
          prevWeekParam={prevWeekParam}
          nextWeekParam={nextWeekParam}
          isCurrentWeek={onCurrentWeek}
        />
      </div>
    </main>
  );
}
