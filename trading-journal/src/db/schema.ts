import { pgTable, uuid, text, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";

// Enums for strict typing
export const tradeDirectionEnum = pgEnum("trade_direction", ["LONG", "SHORT"]);
export const tradeOutcomeEnum = pgEnum("trade_outcome", ["WIN", "LOSS", "BREAKEVEN"]);

export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),

  // --- Core Trade Data ---
  symbol: text("symbol").notNull(), // e.g., "EURUSD"
  direction: tradeDirectionEnum("direction").notNull(),
  outcome: tradeOutcomeEnum("outcome").notNull(),

  // --- Financials ---
  // We use numeric for money. Never use float for money.
  netPnl: numeric("net_pnl", { precision: 12, scale: 2 }).notNull(),
  riskReward: numeric("risk_reward", { precision: 5, scale: 2 }), // e.g., 2.50 for 1:2.5

  // --- Timing ---
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }).notNull(),

  // --- Journaling ---
  strategy: text("strategy"), // e.g., "LONDON_SWEEP", "NY_REVERSAL"
  notes: text("notes"), // The "Why" section from your reference
  chartUrl: text("chart_url"), // R2 image URL

  // --- Metadata ---
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const playbookSetups = pgTable("playbook_setups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  rules: text("rules").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});