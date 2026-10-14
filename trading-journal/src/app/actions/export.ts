"use server";

import { db } from "@/db";
import {
  trades,
  accounts,
  weeklyReviews,
  certificates,
  playbooks,
  payouts,
  expenses,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { eq, isNull } from "drizzle-orm";
import type { ActionResult } from "@/types/actions";

export async function exportAllUserData(): Promise<ActionResult<string>> {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { error: "Not authenticated" };
    }

    // Fetch all user data in parallel
    const [
      userTrades,
      userAccounts,
      userReviews,
      userCertificates,
      userPlaybooks,
      userPayouts,
      userExpenses,
    ] = await Promise.all([
      db
        .select()
        .from(trades)
        .where(eq(trades.userId, user.id)),
      db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id)),
      db
        .select()
        .from(weeklyReviews)
        .where(eq(weeklyReviews.userId, user.id)),
      db
        .select()
        .from(certificates)
        .where(eq(certificates.userId, user.id)),
      db
        .select()
        .from(playbooks)
        .where(eq(playbooks.userId, user.id)),
      db
        .select()
        .from(payouts)
        .where(eq(payouts.userId, user.id)),
      db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, user.id)),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      trades: userTrades,
      accounts: userAccounts,
      weeklyReviews: userReviews,
      certificates: userCertificates,
      playbooks: userPlaybooks,
      payouts: userPayouts,
      expenses: userExpenses,
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    logger.info("User data exported", { userId: user.id });

    return { data: jsonData };
  } catch (error) {
    logger.error("Failed to export user data", {}, error instanceof Error ? error : undefined);
    return { error: "Failed to export data. Please try again." };
  }
}
