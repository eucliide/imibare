"use server";

import { db } from "@/db";
import { weeklyReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { paramToWeekStart } from "@/lib/week";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { weeklyReviewSchema } from "@/lib/schemas";
import type { ActionResult } from "@/types/actions";

export async function upsertWeeklyReview(
  weekStartIso: string,
  notes: string,
  mood: string | null,
  discipline: number | null = null,
  focus: number | null = null,
  patience: number | null = null,
  winsOfWeek: string | null = null,
  improveNext: string | null = null
): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const parsed = weeklyReviewSchema.safeParse({
      weekStartIso,
      notes,
      mood,
      discipline,
      focus,
      patience,
      winsOfWeek,
      improveNext,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const weekStart = paramToWeekStart(parsed.data.weekStartIso);
    if (!weekStart) return { success: false, error: "Invalid week date." };

    const now = new Date();
    const vals = {
      userId: user.id,
      weekStart,
      notes: parsed.data.notes,
      mood: parsed.data.mood,
      discipline: parsed.data.discipline,
      focus: parsed.data.focus,
      patience: parsed.data.patience,
      winsOfWeek: parsed.data.winsOfWeek,
      improveNext: parsed.data.improveNext,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .insert(weeklyReviews)
      .values(vals)
      .onConflictDoUpdate({
        target: [weeklyReviews.userId, weeklyReviews.weekStart],
        set: {
          notes: vals.notes,
          mood: vals.mood,
          discipline: vals.discipline,
          focus: vals.focus,
          patience: vals.patience,
          winsOfWeek: vals.winsOfWeek,
          improveNext: vals.improveNext,
          updatedAt: now,
        },
      });

    revalidatePath("/review");
    return { success: true };
  } catch (error) {
    console.error("[action:upsertWeeklyReview]", error);
    return { success: false, error: "Failed to save review." };
  }
}

export async function getWeeklyReview(weekStartIso: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const weekStart = paramToWeekStart(weekStartIso);
  if (!weekStart) return null;

  const rows = await db
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.userId, user.id),
        eq(weeklyReviews.weekStart, weekStart)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}
