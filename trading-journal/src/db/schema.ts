import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  integer,
  pgEnum,
  uniqueIndex,
  index,
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

  deletedAt: timestamp("deleted_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Trade Edits (audit log) ──────────────────────────────────────────────────

export const tradeEdits = pgTable(
  "trade_edits",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tradeId: uuid("trade_id")
      .notNull()
      .references(() => trades.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // "create" | "update" | "delete" | "restore"
    action: text("action").notNull(),

    // JSON: { field: { from, to } } for updates, "" for delete/restore
    changes: text("changes").notNull().default(""),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("trade_edits_trade_id_idx").on(table.tradeId),
    index("trade_edits_user_created_idx").on(table.userId, table.createdAt),
  ]
);

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export const benchmarks = pgTable("benchmarks", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  // "index" | "flat" | "custom"
  kind: text("kind").notNull(),
  // used when kind = "index"
  symbol: text("symbol"),
  // used when kind = "custom" — e.g. 20.00 for 20% annual
  annualTargetPct: numeric("annual_target_pct", { precision: 6, scale: 2 }),
  isDefault: boolean("is_default").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const benchmarkPrices = pgTable(
  "benchmark_prices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    date: text("date").notNull(), // stored as "YYYY-MM-DD"
    close: numeric("close", { precision: 12, scale: 4 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("benchmark_prices_symbol_date_idx").on(table.symbol, table.date),
  ]
);

// ─── Certificates ────────────────────────────────────────────────────────────

export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    firm: text("firm").notNull(),
    accountSize: numeric("account_size", { precision: 14, scale: 2 }).notNull(),
    profitTarget: numeric("profit_target", { precision: 14, scale: 2 }).notNull(),
    maxDrawdown: numeric("max_drawdown", { precision: 14, scale: 2 }).notNull(),
    // "challenge" | "verification" | "funded"
    phase: text("phase").notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true }).notNull(),
    certificateUrl: text("certificate_url"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("certificates_user_achieved_idx").on(table.userId, table.achievedAt),
  ]
);

// ─── Payouts ──────────────────────────────────────────────────────────────────

export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),

    // Multi-currency conversion is out of scope for v1;
    // all totals assume the payout's currency matches the account's.
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    fee: numeric("fee", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    // "bank" | "crypto" | "wise" | "paypal" | "other"
    method: text("method"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payouts_user_received_idx").on(table.userId, table.receivedAt),
  ]
);

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

    // Mindset sliders (1–10, nullable)
    discipline: integer("discipline"),
    focus: integer("focus"),
    patience: integer("patience"),

    // Mindset prompts
    winsOfWeek: text("wins_of_week"),
    improveNext: text("improve_next"),

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
