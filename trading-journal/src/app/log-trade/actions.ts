"use server";

import { db } from "@/db";
import { trades, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const tradeSchema = z.object({
  accountId: z.string().uuid("Invalid account"),
  symbol: z.string().min(1, "Symbol is required").max(10),
  direction: z.enum(["LONG", "SHORT"]),
  outcome: z.enum(["WIN", "LOSS", "BREAKEVEN"]),
  netPnl: z.coerce.number(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  chartUrl: z
    .string()
    .url("Invalid chart URL")
    .optional()
    .or(z.literal("")),
});

export async function logTrade(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const rawData = {
    accountId: formData.get("accountId"),
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

  const validated = tradeSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: "Invalid data. Please check all fields." };
  }

  const data = validated.data;

  // Verify account belongs to user
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, data.accountId), eq(accounts.userId, user.id)))
    .limit(1);

  if (!account) {
    return { success: false, error: "Invalid account." };
  }

  try {
    await db.insert(trades).values({
      userId: user.id,
      accountId: data.accountId,
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      outcome: data.outcome,
      netPnl: data.netPnl.toString(),
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      strategy: data.strategy?.toUpperCase() || null,
      notes: data.notes || null,
      chartUrl: data.chartUrl || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to save trade. Please try again." };
  }
}
