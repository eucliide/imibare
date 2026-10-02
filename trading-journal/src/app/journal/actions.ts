"use server";

import { db } from "@/db";
import { trades, accounts, playbookSetups, tradeEdits } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const tradeSchema = z.object({
  accountId: z.string().uuid(),
  setupId: z.string().uuid().nullable().optional(),
  symbol: z.string().min(1).max(10),
  direction: z.enum(["LONG", "SHORT"]),
  outcome: z.enum(["WIN", "LOSS", "BREAKEVEN"]),
  netPnl: z.coerce.number(),
  riskReward: z.coerce.number().nullable().optional(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  chartUrl: z.string().url().optional().or(z.literal("")),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertTradeOwner(tradeId: string, userId: string) {
  const [trade] = await db
    .select()
    .from(trades)
    .where(and(eq(trades.id, tradeId), eq(trades.userId, userId)))
    .limit(1);
  return trade ?? null;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTrade(tradeId: string, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await assertTradeOwner(tradeId, user.id);
  if (!existing) return { success: false, error: "Trade not found." };

  const rawSetupId = formData.get("setupId");
  const setupIdValue =
    rawSetupId === "" || rawSetupId === null ? null : (rawSetupId as string);

  const validated = tradeSchema.safeParse({
    accountId: formData.get("accountId"),
    setupId: setupIdValue,
    symbol: formData.get("symbol"),
    direction: formData.get("direction"),
    outcome: formData.get("outcome"),
    netPnl: formData.get("netPnl"),
    riskReward: formData.get("riskReward") || null,
    openedAt: formData.get("openedAt"),
    closedAt: formData.get("closedAt"),
    strategy: formData.get("strategy"),
    notes: formData.get("notes"),
    chartUrl: formData.get("chartUrl"),
  });

  if (!validated.success) return { success: false, error: "Invalid data." };
  const data = validated.data;

  const now = new Date();
  if (data.openedAt > now) {
    return { success: false, error: "Open time cannot be in the future." };
  }
  if (data.closedAt > now) {
    return { success: false, error: "Close time cannot be in the future." };
  }
  if (data.openedAt > data.closedAt) {
    return { success: false, error: "Open time must be before close time." };
  }

  // Verify account ownership
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, data.accountId), eq(accounts.userId, user.id)))
    .limit(1);
  if (!account) return { success: false, error: "Invalid account." };

  // Verify setup ownership
  if (data.setupId) {
    const [setup] = await db
      .select({ id: playbookSetups.id })
      .from(playbookSetups)
      .where(
        and(
          eq(playbookSetups.id, data.setupId),
          eq(playbookSetups.userId, user.id)
        )
      )
      .limit(1);
    if (!setup) return { success: false, error: "Invalid setup." };
  }

  // Build changes diff for audit log
  const next = {
    symbol: data.symbol.toUpperCase(),
    direction: data.direction,
    outcome: data.outcome,
    netPnl: data.netPnl.toString(),
    accountId: data.accountId,
    setupId: data.setupId ?? null,
    strategy: data.strategy?.toUpperCase() || null,
    notes: data.notes || null,
    chartUrl: data.chartUrl || null,
    openedAt: data.openedAt.toISOString(),
    closedAt: data.closedAt.toISOString(),
  };

  type ChangeEntry = { from: unknown; to: unknown };
  const changes: Record<string, ChangeEntry> = {};
  for (const [k, v] of Object.entries(next)) {
    const prev = (existing as Record<string, unknown>)[k];
    const prevStr = prev instanceof Date ? prev.toISOString() : String(prev ?? "");
    const nextStr = String(v ?? "");
    if (prevStr !== nextStr) changes[k] = { from: prev, to: v };
  }

  await db
    .update(trades)
    .set({
      accountId: data.accountId,
      setupId: data.setupId ?? null,
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      outcome: data.outcome,
      netPnl: data.netPnl.toString(),
      riskReward: data.riskReward != null ? data.riskReward.toString() : null,
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      strategy: data.strategy?.toUpperCase() || null,
      notes: data.notes || null,
      chartUrl: data.chartUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(trades.id, tradeId), eq(trades.userId, user.id)));

  await db.insert(tradeEdits).values({
    tradeId,
    userId: user.id,
    action: "update",
    changes: JSON.stringify(changes),
  });

  return { success: true };
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export async function softDeleteTrade(tradeId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await assertTradeOwner(tradeId, user.id);
  if (!existing) return { success: false, error: "Trade not found." };

  await db
    .update(trades)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(trades.id, tradeId), eq(trades.userId, user.id)));

  await db.insert(tradeEdits).values({
    tradeId,
    userId: user.id,
    action: "delete",
    changes: "",
  });

  return { success: true };
}

// ─── Restore (Undo) ───────────────────────────────────────────────────────────

export async function restoreTrade(tradeId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [trade] = await db
    .select()
    .from(trades)
    .where(and(eq(trades.id, tradeId), eq(trades.userId, user.id)))
    .limit(1);

  if (!trade) return { success: false, error: "Trade not found." };

  await db
    .update(trades)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(trades.id, tradeId), eq(trades.userId, user.id)));

  await db.insert(tradeEdits).values({
    tradeId,
    userId: user.id,
    action: "restore",
    changes: "",
  });

  return { success: true };
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateTrade(tradeId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await assertTradeOwner(tradeId, user.id);
  if (!existing || existing.deletedAt)
    return { success: false, error: "Trade not found." };

  const [newTrade] = await db
    .insert(trades)
    .values({
      userId: user.id,
      accountId: existing.accountId,
      setupId: existing.setupId,
      symbol: existing.symbol,
      direction: existing.direction,
      outcome: existing.outcome,
      netPnl: existing.netPnl,
      riskReward: existing.riskReward,
      openedAt: existing.openedAt,
      closedAt: existing.closedAt,
      strategy: existing.strategy,
      notes: existing.notes,
      chartUrl: existing.chartUrl,
    })
    .returning({ id: trades.id });

  await db.insert(tradeEdits).values({
    tradeId: newTrade.id,
    userId: user.id,
    action: "create",
    changes: JSON.stringify({ duplicatedFrom: tradeId }),
  });

  return { success: true, newId: newTrade.id };
}

// ─── Bulk Delete ──────────────────────────────────────────────────────────────

export async function bulkDeleteTrades(tradeIds: string[]) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (!tradeIds.length) return { success: true };

  await db
    .update(trades)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        inArray(trades.id, tradeIds),
        eq(trades.userId, user.id),
        isNull(trades.deletedAt)
      )
    );

  await db.insert(tradeEdits).values(
    tradeIds.map((id) => ({
      tradeId: id,
      userId: user.id,
      action: "delete" as const,
      changes: "",
    }))
  );

  return { success: true };
}

// ─── Bulk Restore ─────────────────────────────────────────────────────────────

export async function bulkRestoreTrades(tradeIds: string[]) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (!tradeIds.length) return { success: true };

  await db
    .update(trades)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(inArray(trades.id, tradeIds), eq(trades.userId, user.id)));

  await db.insert(tradeEdits).values(
    tradeIds.map((id) => ({
      tradeId: id,
      userId: user.id,
      action: "restore" as const,
      changes: "",
    }))
  );

  return { success: true };
}

// ─── Bulk Retag ───────────────────────────────────────────────────────────────

export async function bulkRetagTrades(tradeIds: string[], setupId: string | null) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (!tradeIds.length) return { success: true };

  if (setupId) {
    const [setup] = await db
      .select({ id: playbookSetups.id })
      .from(playbookSetups)
      .where(
        and(eq(playbookSetups.id, setupId), eq(playbookSetups.userId, user.id))
      )
      .limit(1);
    if (!setup) return { success: false, error: "Invalid setup." };
  }

  await db
    .update(trades)
    .set({ setupId, updatedAt: new Date() })
    .where(
      and(
        inArray(trades.id, tradeIds),
        eq(trades.userId, user.id),
        isNull(trades.deletedAt)
      )
    );

  return { success: true };
}

// ─── Bulk Reassign Account ────────────────────────────────────────────────────

export async function bulkReassignAccount(tradeIds: string[], accountId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (!tradeIds.length) return { success: true };

  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, user.id)))
    .limit(1);
  if (!account) return { success: false, error: "Invalid account." };

  await db
    .update(trades)
    .set({ accountId, updatedAt: new Date() })
    .where(
      and(
        inArray(trades.id, tradeIds),
        eq(trades.userId, user.id),
        isNull(trades.deletedAt)
      )
    );

  return { success: true };
}

// ─── Get single trade for edit form ──────────────────────────────────────────

export async function getTrade(tradeId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [trade] = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.id, tradeId),
        eq(trades.userId, user.id),
        isNull(trades.deletedAt)
      )
    )
    .limit(1);

  return trade ?? null;
}
