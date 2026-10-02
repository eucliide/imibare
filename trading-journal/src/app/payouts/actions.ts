"use server";

// Hard deletes are intentional for payouts — they are accounting records,
// not a journal feed. Soft delete is not needed.

import { db } from "@/db";
import { payouts, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const payoutSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  fee: z.coerce.number().min(0).default(0),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase()),
  method: z.enum(["bank", "crypto", "wise", "paypal", "other"]).nullable().optional(),
  receivedAt: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

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

export async function createPayout(formData: FormData) {
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

  if (!parsed.success) return { success: false, error: "Invalid data. Check all fields." };
  const d = parsed.data;

  const account = await assertAccountOwner(d.accountId, user.id);
  if (!account) return { success: false, error: "Account not found." };

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
  return { success: true };
}

export async function updatePayout(id: string, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [existing] = await db
    .select({ id: payouts.id })
    .from(payouts)
    .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)))
    .limit(1);
  if (!existing) return { success: false, error: "Payout not found." };

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

  if (!parsed.success) return { success: false, error: "Invalid data. Check all fields." };
  const d = parsed.data;

  const account = await assertAccountOwner(d.accountId, user.id);
  if (!account) return { success: false, error: "Account not found." };

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
  return { success: true };
}

export async function deletePayout(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  await db
    .delete(payouts)
    .where(and(eq(payouts.id, id), eq(payouts.userId, user.id)));

  revalidateAll();
  return { success: true };
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
