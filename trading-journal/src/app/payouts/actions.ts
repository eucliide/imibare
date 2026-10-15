"use server";

// Hard deletes are intentional for payouts — they are accounting records,
// not a journal feed. Soft delete is not needed.

import { db } from "@/db";
import { payouts, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payoutSchema } from "@/lib/schemas";
import { ok, fail, type ActionResult } from "@/types/actions";

async function assertAccountOwner(accountId: string, userId: string) {
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1);
  return account ?? null;
}

function revalidateAll() {
  revalidatePath("/payouts");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function createPayout(formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const rawMethod = formData.get("method");
    const parsed = payoutSchema.safeParse({
      accountId: formData.get("accountId"),
      amount: formData.get("amount"),
      fee: formData.get("fee") || 0,
      currency: formData.get("currency") || "USD",
      method: rawMethod === "" || rawMethod === null ? null : rawMethod,
      receivedAt: formData.get("receivedAt"),
      notes: formData.get("notes"),
    });

    if (!parsed.success)
      return fail("Invalid data. Check all fields.");
    const d = parsed.data;

    const account = await assertAccountOwner(d.accountId, user.id);
    if (!account) return fail("Account not found.");

    await db.insert(payouts).values({
      userId: user.id,
      accountId: d.accountId,
      amount: d.amount.toString(),
      fee: d.fee.toString(),
      currency: d.currency,
      method: d.method ?? null,
      receivedAt: d.receivedAt,
      notes: d.notes || null,
    });

    revalidateAll();
    return ok();
  } catch (error) {
    console.error("[action:createPayout]", error);
    return fail("Failed to create payout.");
  }
}

export async function updatePayout(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const [existing] = await db
      .select({ id: payouts.id })
      .from(payouts)
      .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)))
      .limit(1);
    if (!existing) return fail("Payout not found.");

    const rawMethod = formData.get("method");
    const parsed = payoutSchema.safeParse({
      accountId: formData.get("accountId"),
      amount: formData.get("amount"),
      fee: formData.get("fee") || 0,
      currency: formData.get("currency") || "USD",
      method: rawMethod === "" || rawMethod === null ? null : rawMethod,
      receivedAt: formData.get("receivedAt"),
      notes: formData.get("notes"),
    });

    if (!parsed.success)
      return fail("Invalid data. Check all fields.");
    const d = parsed.data;

    const account = await assertAccountOwner(d.accountId, user.id);
    if (!account) return fail("Account not found.");

    await db
      .update(payouts)
      .set({
        accountId: d.accountId,
        amount: d.amount.toString(),
        fee: d.fee.toString(),
        currency: d.currency,
        method: d.method ?? null,
        receivedAt: d.receivedAt,
        notes: d.notes || null,
        updatedAt: new Date(),
      })
      .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)));

    revalidateAll();
    return ok();
  } catch (error) {
    console.error("[action:updatePayout]", error);
    return fail("Failed to update payout.");
  }
}

export async function deletePayout(id: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    await db
      .delete(payouts)
      .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)));

    revalidateAll();
    return ok();
  } catch (error) {
    console.error("[action:deletePayout]", error);
    return fail("Failed to delete payout.");
  }
}

export async function getPayout(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [payout] = await db
    .select()
    .from(payouts)
    .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)))
    .limit(1);

  return payout ?? null;
}

