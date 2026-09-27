import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
  uniqueIndex,
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

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    broker: text("broker"),
    startingBalance: numeric("starting_balance", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    isArchived: boolean("is_archived").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("accounts_user_name_idx").on(table.userId, table.name),
  ]
);

// ─── Trades ───────────────────────────────────────────────────────────────────

export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),

  symbol: text("symbol").notNull(),
  direction: tradeDirectionEnum("direction").notNull(),
  outcome: tradeOutcomeEnum("outcome").notNull(),

  netPnl: numeric("net_pnl", { precision: 12, scale: 2 }).notNull(),
  riskReward: numeric("risk_reward", { precision: 5, scale: 2 }),

  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }).notNull(),

  setupId: uuid("setup_id").references(() => playbookSetups.id, {
    onDelete: "set null",
  }),

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

// ─── Weekly Reviews ───────────────────────────────────────────────────────────

export const weeklyReviews = pgTable(
  "weekly_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Monday 00:00:00 UTC of the week being reviewed
    weekStart: timestamp("week_start", { withTimezone: true }).notNull(),

    notes: text("notes").notNull().default(""),

    // One of: confident | neutral | frustrated | disciplined — nullable
    mood: text("mood"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("weekly_reviews_user_week_idx").on(
      table.userId,
      table.weekStart
    ),
  ]
);
