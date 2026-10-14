import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(80),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Trade Schemas ────────────────────────────────────────────────────────────

export const tradeSchema = z.object({
  accountId: z.string().uuid("Invalid account"),
  setupId: z.string().uuid().nullable().optional(),
  symbol: z.string().min(1, "Symbol is required").max(10),
  direction: z.enum(["LONG", "SHORT"]),
  outcome: z.enum(["WIN", "LOSS", "BREAKEVEN"]),
  netPnl: z.coerce.number(),
  riskReward: z.coerce.number().nullable().optional(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  chartUrl: z.string().url("Invalid chart URL").optional().or(z.literal("")),
});

export type TradeInput = z.infer<typeof tradeSchema>;

export const tradeUpdateSchema = tradeSchema;
export type TradeUpdateInput = z.infer<typeof tradeUpdateSchema>;

export const bulkIdsSchema = z
  .array(z.string().uuid())
  .min(1, "At least one ID required")
  .max(100, "Cannot process more than 100 items at once");

export type BulkIdsInput = z.infer<typeof bulkIdsSchema>;

// ─── Account Schemas ──────────────────────────────────────────────────────────

export const accountSchema = z.object({
  name: z.string().min(1).max(80),
  broker: z.string().max(80).optional().or(z.literal("")),
  startingBalance: z.coerce.number().positive(),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase()),
});

export type AccountInput = z.infer<typeof accountSchema>;

// ─── Playbook Setup Schemas ───────────────────────────────────────────────────

export const setupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  rules: z.string().min(1, "Rules are required").max(2000),
});

export type SetupInput = z.infer<typeof setupSchema>;

// ─── Certificate Schemas ──────────────────────────────────────────────────────

export const certificateSchema = z.object({
  accountId: z.string().uuid(),
  firm: z.string().min(1).max(80),
  accountSize: z.coerce.number().positive(),
  profitTarget: z.coerce.number().positive(),
  maxDrawdown: z.coerce.number().positive(),
  phase: z.enum(["challenge", "verification", "funded"]),
  achievedAt: z.coerce.date(),
  certificateUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export type CertificateInput = z.infer<typeof certificateSchema>;

// ─── Payout Schemas ───────────────────────────────────────────────────────────

export const payoutSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  fee: z.coerce.number().min(0).default(0),
  currency: z
    .string()
    .length(3)
    .transform((v) => v.toUpperCase()),
  method: z
    .enum(["bank", "crypto", "wise", "paypal", "other"])
    .nullable()
    .optional(),
  receivedAt: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

export type PayoutInput = z.infer<typeof payoutSchema>;

// ─── Expense Schemas ──────────────────────────────────────────────────────────

// Import constants for validation
import { EXPENSE_CATEGORIES, RECURRENCE_OPTIONS } from "@/lib/expense-categories";

const categoryValues = EXPENSE_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];
const recurrenceValues = RECURRENCE_OPTIONS as unknown as [string, ...string[]];

export const expenseSchema = z
  .object({
    amount: z.coerce.number().positive(),
    currency: z
      .string()
      .length(3)
      .transform((v) => v.toUpperCase()),
    category: z.enum(categoryValues),
    description: z.string().min(1).max(200),
    vendor: z.string().max(100).optional(),
    spentAt: z.coerce.date(),
    isRecurring: z.coerce.boolean().default(false),
    recurrence: z.enum(recurrenceValues).nullable().optional(),
    notes: z.string().max(2000).optional(),
    accountId: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurrence) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurrence"],
        message: "Recurrence is required when the expense is recurring.",
      });
    }
  });

export type ExpenseInput = z.infer<typeof expenseSchema>;

// ─── Weekly Review Schemas ────────────────────────────────────────────────────

const VALID_MOODS = [
  "confident",
  "neutral",
  "frustrated",
  "disciplined",
] as const;

export const weeklyReviewSchema = z.object({
  weekStartIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().max(5000),
  mood: z.enum(VALID_MOODS).nullable(),
  discipline: z.number().int().min(1).max(10).nullable(),
  focus: z.number().int().min(1).max(10).nullable(),
  patience: z.number().int().min(1).max(10).nullable(),
  winsOfWeek: z.string().max(2000).nullable(),
  improveNext: z.string().max(2000).nullable(),
});

export type WeeklyReviewInput = z.infer<typeof weeklyReviewSchema>;

// ─── Benchmark Schemas ────────────────────────────────────────────────────────

export const benchmarkSchema = z.object({
  name: z.string().min(1).max(80),
  kind: z.enum(["index", "flat", "custom"]),
  symbol: z.string().max(20).nullable().optional(),
  annualTargetPct: z.coerce.number().min(0).max(100).nullable().optional(),
  isDefault: z.boolean().default(false),
});

export type BenchmarkInput = z.infer<typeof benchmarkSchema>;
