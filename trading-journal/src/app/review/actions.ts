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

const upsertSchema = z.object({
  weekStartIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().max(5000),
  mood: z.enum(VALID_MOODS).nullable(),
  discipline: z.number().int().min(1).max(10).nullable(),
  focus: z.number().int().min(1).max(10).nullable(),
  patience: z.number().int().min(1).max(10).nullable(),
  winsOfWeek: z.string().max(2000).nullable(),
  improveNext: z.string().max(2000).nullable(),
});

export async function upsertWeeklyReview(
  weekStartIso: string,
  notes: string,
  mood: string | null,
  discipline: number | null = null,
  focus: number | null = null,
  patience: number | null = null,
  winsOfWeek: string | null = null,
  improveNext: string | null = null
): Promise<{ success: true } | { success: false; error: string }> {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = upsertSchema.safeParse({
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

  try {
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
