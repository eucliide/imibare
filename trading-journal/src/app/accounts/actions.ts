"use server";

import { db } from "@/db";
import { accounts, trades } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { accountSchema } from "@/lib/schemas";
import { ok, fail, type ActionResult } from "@/types/actions";

export async function createAccount(formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const parsed = accountSchema.safeParse({
      name: formData.get("name"),
      broker: formData.get("broker"),
      startingBalance: formData.get("startingBalance"),
      currency: formData.get("currency") || "USD",
    });

    if (!parsed.success) {
      return fail("Invalid data. Check all fields.");
    }

    const { name, broker, startingBalance, currency } = parsed.data;

    await db.insert(accounts).values({
      userId: user.id,
      name,
      broker: broker || null,
      startingBalance: startingBalance.toString(),
      currency,
    });

    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    logger.error("Failed to create account", { userId: user.id }, error instanceof Error ? error : undefined);
    return fail("An account with that name already exists.");
  }
}

export async function updateAccount(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    const parsed = accountSchema.safeParse({
      name: formData.get("name"),
      broker: formData.get("broker"),
      startingBalance: formData.get("startingBalance"),
      currency: formData.get("currency") || "USD",
    });

    if (!parsed.success) {
      return fail("Invalid data. Check all fields.");
    }

    const { name, broker, startingBalance, currency } = parsed.data;

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
    return ok();
  } catch (error) {
    logger.error("Failed to update account", { userId: user.id, accountId: id }, error instanceof Error ? error : undefined);
    return fail("An account with that name already exists.");
  }
}

export async function archiveAccount(id: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    await db
      .update(accounts)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    logger.error("Failed to archive account", { userId: user.id, accountId: id }, error instanceof Error ? error : undefined);
    return fail("Failed to archive account.");
  }
}

export async function unarchiveAccount(id: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    await db
      .update(accounts)
      .set({ isArchived: false, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)));

    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return ok();
  } catch (error) {
    logger.error("Failed to unarchive account", { userId: user.id, accountId: id }, error instanceof Error ? error : undefined);
    return fail("Failed to unarchive account.");
  }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login");

    // Verify ownership first
    const [account] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
      .limit(1);

    if (!account) return fail("Account not found.");

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
    return ok();
  } catch (error) {
    logger.error("Failed to delete account", { userId: user.id, accountId: id }, error instanceof Error ? error : undefined);
    return fail("Failed to delete account.");
  }
}
