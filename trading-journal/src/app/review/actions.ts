"use server";

import { db } from "@/db";
import { weeklyReviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { paramToWeekStart } from "@/lib/week";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const VALID_MOODS = ["confident", "neutral", "frustrated", "disciplined"] as const;
type Mood = (typeof VALID_MOODS)[number];

const upsertSchema = z.object({
  weekStartIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().max(5000),
  mood: z.enum(VALID_MOODS).nullable(),
});

export async function upsertWeeklyReview(
  weekStartIso: string,
  notes: string,
  mood: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = upsertSchema.safeParse({ weekStartIso, notes, mood });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const weekStart = paramToWeekStart(parsed.data.weekStartIso);
  if (!weekStart) {
    return { success: false, error: "Invalid week date." };
  }

  const now = new Date();

  try {
    await db
      .insert(weeklyReviews)
      .values({
        userId: user.id,
        weekStart,
        notes: parsed.data.notes,
        mood: parsed.data.mood,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [weeklyReviews.userId, weeklyReviews.weekStart],
        set: {
          notes: parsed.data.notes,
          mood: parsed.data.mood,
          updatedAt: now,
        },
      });

    revalidatePath("/review");
    return { success: true };
  } catch (err) {
    console.error("upsertWeeklyReview error:", err);
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
