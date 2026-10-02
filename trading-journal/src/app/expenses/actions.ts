"use server";

// Expenses use hard delete (not soft delete like trades).
// Undo is implemented by recreating the row via createExpense — a pragmatic
// approach for a low-stakes entity. The deleted row's payload is returned to
// the client so it can call createExpense with the same data on undo.

import { db } from "@/db";
import { expenses, accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EXPENSE_CATEGORIES, RECURRENCE_OPTIONS } from "@/lib/expense-categories";

const categoryValues = EXPENSE_CATEGORIES.map((c) => c.value) as [string, ...string[]];
const recurrenceValues = RECURRENCE_OPTIONS as unknown as [string, ...string[]];

const expenseSchema = z
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

async function assertAccountOwner(accountId: string, userId: string) {
  const [row] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1);
  return row ?? null;
}

function revalidateAll() {
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/payouts");
  revalidatePath("/accounts");
}

function parseFormData(formData: FormData) {
  const raw = formData.get("isRecurring");
  return {
    amount: formData.get("amount"),
    currency: formData.get("currency") || "USD",
    category: formData.get("category"),
    description: formData.get("description"),
    vendor: formData.get("vendor") || undefined,
    spentAt: formData.get("spentAt"),
    isRecurring: raw === "true" || raw === "on" || raw === "1",
    recurrence: formData.get("recurrence") || null,
    notes: formData.get("notes") || undefined,
    accountId: formData.get("accountId") || null,
  };
}

export async function createExpense(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = expenseSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid data.";
    return { success: false as const, error: msg };
  }
  const d = parsed.data;

  if (d.accountId) {
    const account = await assertAccountOwner(d.accountId, user.id);
    if (!account) return { success: false as const, error: "Account not found." };
  }

  const [row] = await db
    .insert(expenses)
    .values({
      userId: user.id,
      accountId: d.accountId ?? null,
      amount: d.amount.toString(),
      currency: d.currency,
      category: d.category,
      description: d.description,
      vendor: d.vendor ?? null,
      spentAt: d.spentAt,
      isRecurring: d.isRecurring,
      recurrence: d.recurrence ?? null,
      notes: d.notes ?? null,
    })
    .returning({ id: expenses.id });

  revalidateAll();
  return { success: true as const, id: row.id };
}

export async function updateExpense(id: string, formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [existing] = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
    .limit(1);
  if (!existing) return { success: false as const, error: "Expense not found." };

  const parsed = expenseSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid data.";
    return { success: false as const, error: msg };
  }
  const d = parsed.data;

  if (d.accountId) {
    const account = await assertAccountOwner(d.accountId, user.id);
    if (!account) return { success: false as const, error: "Account not found." };
  }

  await db
    .update(expenses)
    .set({
      accountId: d.accountId ?? null,
      amount: d.amount.toString(),
      currency: d.currency,
      category: d.category,
      description: d.description,
      vendor: d.vendor ?? null,
      spentAt: d.spentAt,
      isRecurring: d.isRecurring,
      recurrence: d.recurrence ?? null,
      notes: d.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));

  revalidateAll();
  return { success: true as const };
}

export type ExpensePayload = {
  amount: string;
  currency: string;
  category: string;
  description: string;
  vendor: string | null;
  spentAt: string;
  isRecurring: boolean;
  recurrence: string | null;
  notes: string | null;
  accountId: string | null;
};

export async function deleteExpense(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [row] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
    .limit(1);
  if (!row) return { success: false as const, error: "Expense not found." };

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));

  revalidateAll();

  // Return the deleted row's payload so the client can recreate it on undo.
  const deleted: ExpensePayload = {
    amount: row.amount,
    currency: row.currency,
    category: row.category,
    description: row.description,
    vendor: row.vendor,
    spentAt: row.spentAt.toISOString(),
    isRecurring: row.isRecurring,
    recurrence: row.recurrence,
    notes: row.notes,
    accountId: row.accountId,
  };

  return { success: true as const, id, deleted };
}

export async function getExpense(id: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [row] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
    .limit(1);

  return row ?? null;
}
