"use server";

import { db } from "@/db";
import { playbookSetups, trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { setupSchema } from "@/lib/schemas";
import { ok, fail, type ActionResult } from "@/types/actions";
import { eq, and, inArray, isNull, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSetup(formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const parsed = setupSchema.safeParse({
      name: formData.get("name"),
      rules: formData.get("rules"),
    });
    
    if (!parsed.success) {
      return fail(parsed.error.errors[0].message);
    }

    await db.insert(playbookSetups).values({
      userId: user.id,
      name: parsed.data.name.toUpperCase(),
      rules: parsed.data.rules,
    });
    
    revalidatePath("/playbook");
    return ok();
  } catch (error) {
    console.error("[action:createSetup]", error);
    return fail("Failed to save setup.");
  }
}

export async function updateSetup(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const parsed = setupSchema.safeParse({
      name: formData.get("name"),
      rules: formData.get("rules"),
    });
    
    if (!parsed.success) {
      return fail(parsed.error.errors[0].message);
    }

    await db
      .update(playbookSetups)
      .set({
        name: parsed.data.name.toUpperCase(),
        rules: parsed.data.rules,
        updatedAt: new Date(),
      })
      .where(and(eq(playbookSetups.id, id), eq(playbookSetups.userId, user.id)));

    revalidatePath("/playbook");
    revalidatePath(`/playbook/${id}`);
    return ok();
  } catch (error) {
    console.error("[action:updateSetup]", error);
    return fail("Failed to update setup.");
  }
}

export async function deleteSetup(id: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    // onDelete: set null handles the FK — just delete
    await db
      .delete(playbookSetups)
      .where(and(eq(playbookSetups.id, id), eq(playbookSetups.userId, user.id)));

    revalidatePath("/playbook");
    revalidatePath("/journal");
    return ok();
  } catch (error) {
    console.error("[action:deleteSetup]", error);
    return fail("Failed to delete setup.");
  }
}

export async function getSetupTradeCount(id: string): Promise<number> {
  const { user } = await getCurrentUser();
  if (!user) return 0;

  const [{ value }] = await db
    .select({ value: count() })
    .from(trades)
    .where(and(eq(trades.setupId, id), eq(trades.userId, user.id)));

  return value;
}

export async function attachSetupToTrades(
  setupId: string,
  tradeIds: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    if (tradeIds.length === 0) {
      return ok({ count: 0 });
    }

    // Verify setup ownership
    const [setup] = await db
      .select({ id: playbookSetups.id })
      .from(playbookSetups)
      .where(
        and(eq(playbookSetups.id, setupId), eq(playbookSetups.userId, user.id))
      )
      .limit(1);

    if (!setup) {
      return fail("Setup not found.");
    }

    // Only update trades that belong to this user
    const updated = await db
      .update(trades)
      .set({ setupId, updatedAt: new Date() })
      .where(and(eq(trades.userId, user.id), inArray(trades.id, tradeIds)))
      .returning({ id: trades.id });

    revalidatePath("/playbook");
    revalidatePath("/journal");
    return ok({ count: updated.length });
  } catch (error) {
    console.error("[action:attachSetupToTrades]", error);
    return fail("Failed to attach setup.");
  }
}

export async function detachSetupFromTrade(tradeId: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    await db
      .update(trades)
      .set({ setupId: null, updatedAt: new Date() })
      .where(and(eq(trades.id, tradeId), eq(trades.userId, user.id)));

    revalidatePath("/playbook");
    revalidatePath("/journal");
    return ok();
  } catch (error) {
    console.error("[action:detachSetupFromTrade]", error);
    return fail("Failed to detach setup.");
  }
}

export async function getUntaggedTrades(limit = 50) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  return db
    .select({
      id: trades.id,
      symbol: trades.symbol,
      outcome: trades.outcome,
      netPnl: trades.netPnl,
      closedAt: trades.closedAt,
    })
    .from(trades)
    .where(and(eq(trades.userId, user.id), isNull(trades.setupId)))
    .orderBy(trades.closedAt)
    .limit(limit);
}
