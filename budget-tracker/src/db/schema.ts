import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// --- Users and Sessions (Lucia) ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// --- Accounts (bank accounts, wallets, cards) ---
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").notNull(), // "checking" | "savings" | "credit" | "cash" | "investment"
    startingBalance: numeric("starting_balance", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    color: text("color"), // optional hex for UI
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userAccountUnique: uniqueIndex("accounts_user_name_unique").on(t.userId, t.name),
  })
);

// --- Categories (groceries, rent, transport, salary, etc.) ---
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").notNull(), // "income" | "expense"
    icon: text("icon"), // lucide icon name
    color: text("color"), // hex
    parentCategoryId: uuid("parent_category_id"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userCategoryUnique: uniqueIndex("categories_user_name_unique").on(t.userId, t.name),
  })
);

// --- Transactions (every income and expense) ---
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // positive for income, negative for expense
    currency: text("currency").notNull().default("USD"),
    description: text("description").notNull(),
    merchant: text("merchant"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("cleared"), // "pending" | "cleared"
    notes: text("notes"),
    receiptUrl: text("receipt_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userOccurredIdx: index("transactions_user_occurred_idx").on(t.userId, t.occurredAt),
  })
);

// --- Recurring bills / subscriptions ---
export const recurringBills = pgTable("recurring_bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  frequency: text("frequency").notNull(), // "weekly" | "biweekly" | "monthly" | "quarterly" | "annual"
  nextDueAt: timestamp("next_due_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Savings goals ---
export const savingsGoals = pgTable("savings_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  targetDate: date("target_date"),
  color: text("color"),
  icon: text("icon"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Budgets (monthly envelope per category) ---
export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    month: date("month").notNull(), // first day of the month
    limitAmount: numeric("limit_amount", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userCategoryMonthUnique: uniqueIndex("budgets_user_category_month_unique").on(
      t.userId,
      t.categoryId,
      t.month
    ),
  })
);
