"use server";

import { db } from "@/db";
import { trades } from "@/db/schema";
import { z } from "zod";

// 1. Define the validation schema
const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10),
  direction: z.enum(["LONG", "SHORT"]),
  outcome: z.enum(["WIN", "LOSS", "BREAKEVEN"]),
  netPnl: z.coerce.number(), // Coerce string to number
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
});

export async function logTrade(formData: FormData) {
  // 2. Extract and validate data
  const rawData = {
    symbol: formData.get("symbol"),
    direction: formData.get("direction"),
    outcome: formData.get("outcome"),
    netPnl: formData.get("netPnl"),
    openedAt: formData.get("openedAt"),
    closedAt: formData.get("closedAt"),
    strategy: formData.get("strategy"),
    notes: formData.get("notes"),
  };

  const validated = tradeSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: "Invalid data. Please check all fields." };
  }

  const data = validated.data;

  // 3. Insert into Neon
  try {
    await db.insert(trades).values({
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      outcome: data.outcome,
      netPnl: data.netPnl.toString(), // Convert back to string for numeric type
      openedAt: data.openedAt,
      closedAt: data.closedAt,
      strategy: data.strategy?.toUpperCase() || null,
      notes: data.notes || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to save trade. Please try again." };
  }
}