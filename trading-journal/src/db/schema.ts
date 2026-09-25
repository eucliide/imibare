import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const tradeDirectionEnum = pgEnum("trade_direction", ["LONG", "SHORT"]);
export const tradeOutcomeEnum = pgEnum("trade_outcome", [
  "WIN",
  "LOSS",
  "BREAKEVEN",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Sessions (Lucia) ─────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─── Trades ───────────────────────────────────────────────────────────────────

export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  symbol: text("symbol").notNull(),
  direction: tradeDirectionEnum("direction").notNull(),
  outcome: tradeOutcomeEnum("outcome").notNull(),

  netPnl: numeric("net_pnl", { precision: 12, scale: 2 }).notNull(),
  riskReward: numeric("risk_reward", { precision: 5, scale: 2 }),

  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }).notNull(),

  strategy: text("strategy"),
  notes: text("notes"),
  chartUrl: text("chart_url"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Playbook Setups ──────────────────────────────────────────────────────────

export const playbookSetups = pgTable("playbook_setups", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  rules: text("rules").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
