"use server";

import { db } from "@/db";
import { trades, accounts, playbookSetups, tradeEdits } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { tradeSchema } from "@/lib/schemas";
import type { ActionResult } from "@/types/actions";

export async function logTrade(formData: FormData): Promise<ActionResult> {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const rawSetupId = formData.get("setupId");
  const setupIdValue =
    rawSetupId === "" || rawSetupId === null ? null : (rawSetupId as string);

  const rawData = {
    accountId: formData.get("accountId"),
    setupId: setupIdValue,
    symbol: formData.get("symbol"),
    direction: formData.get("direction"),
    outcome: formData.get("outcome"),
    netPnl: formData.get("netPnl"),
    openedAt: formData.get("openedAt"),
    closedAt: formData.get("closedAt"),
    strategy: formData.get("strategy"),
    notes: formData.get("notes"),
    chartUrl: formData.get("chartUrl"),
  };

  try {
    const validated = tradeSchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: "Invalid data. Please check all fields." };
    }

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

    // Verify account belongs to user
    const [account] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.id, data.accountId), eq(accounts.userId, user.id)))
      .limit(1);

    if (!account) return { success: false, error: "Invalid account." };

    // Verify setup belongs to user (if provided)
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

    const [newTrade] = await db.insert(trades).values({
      userId: user.id,
      accountId: data.accountId,
      setupId: data.setupId ?? null,
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      outcome: data.outcome,
      netPnl: data.netPnl.toString(),
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      strategy: data.strategy?.toUpperCase() || null,
      notes: data.notes || null,
      chartUrl: data.chartUrl || null,
    }).returning({ id: trades.id });

    await db.insert(tradeEdits).values({
      tradeId: newTrade.id,
      userId: user.id,
      action: "create",
      changes: "",
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to log trade", { userId: user.id }, error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to save trade. Please try again." };
  }
}
