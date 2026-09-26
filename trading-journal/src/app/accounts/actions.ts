"use server";

import { db } from "@/db";
import { accounts, trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(1).max(80),
  broker: z.string().max(80).optional().or(z.literal("")),
  startingBalance: z.coerce.number().positive(),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase()),
});

export async function createAccount(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    broker: formData.get("broker"),
    startingBalance: formData.get("startingBalance"),
    currency: formData.get("currency") || "USD",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid data. Check all fields." };
  }

  const { name, broker, startingBalance, currency } = parsed.data;

  try {
    await db.insert(accounts).values({
      userId: user.id,
      name,
      broker: broker || null,
      startingBalance: startingBalance.toString(),
      currency,
    });

    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "An account with that name already exists." };
  }
}

export async function updateAccount(id: string, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    broker: formData.get("broker"),
    startingBalance: formData.get("startingBalance"),
    currency: formData.get("currency") || "USD",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid data. Check all fields." };
  }

  const { name, broker, startingBalance, currency } = parsed.data;

  try {
    await db
      .update(accounts)
      .set({
        name,
        broker: broker || null,
        startingBalance: startingBalance.toString(),
        currency,
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "An account with that name already exists." };
  }
}

export async function archiveAccount(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  await db
    .update(accounts)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unarchiveAccount(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  await db
    .update(accounts)
    .set({ isArchived: false, updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccount(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  // Verify ownership first
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
    .limit(1);

  if (!account) return { success: false, error: "Account not found." };

  // Refuse if trades exist
  const [{ value: tradeCount }] = await db
    .select({ value: count() })
    .from(trades)
    .where(eq(trades.accountId, id));

  if (tradeCount > 0) {
    return {
      success: false,
      error: `This account has ${tradeCount} trade${tradeCount === 1 ? "" : "s"}. Archive it instead.`,
    };
  }

  await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}
