"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AnimatedNumber } from "@/components/animated-number";
import { MetricCard } from "@/components/metric-card";
import { UndoToast } from "@/components/undo-toast";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { EXPENSE_CATEGORIES, RECURRENCE_OPTIONS, getCategoryLabel } from "@/lib/expense-categories";
import { createExpense, updateExpense, deleteExpense } from "./actions";
import type { ExpenseStats, CumulativePoint } from "@/lib/expenses";
import type { ExpensePayload } from "./actions";

type Account = { id: string; name: string };

type Expense = {
  id: string;
  amount: string;
  currency: string;
  category: string;
  description: string;
  vendor: string | null;
  spentAt: Date;
  isRecurring: boolean;
  recurrence: string | null;
  notes: string | null;
  accountId: string | null;
  accountName: string | null;
};

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50";
const SELECT =
  "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50";
const LABEL =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500";

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

function todayInput() {
  return new Date().toISOString().split("T")[0];
}

function yFmt(v: number) {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-0.5 font-medium text-rose-400">
        ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function RecurringBadge({
  recurrence,
  amount,
}: {
  recurrence: string | null;
  amount: string;
}) {
  const monthly =
    recurrence === "quarterly"
      ? parseFloat(amount) / 3
      : recurrence === "annual"
      ? parseFloat(amount) / 12
      : parseFloat(amount);

  const label =
    recurrence === "quarterly"
      ? "Quarterly"
      : recurrence === "annual"
      ? "Annual"
      : "Monthly";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {label} · ${monthly.toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo
    </span>
  );
}

function ExpenseForm({
  accounts,
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  accounts: Account[];
  initial?: Expense;
  onSave: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);

  async function handle(fd: FormData) {
    setBusy(true);
    setError(null);
    fd.set("isRecurring", isRecurring ? "true" : "false");
    const res = await onSave(fd);
    if (!res.success) setError(res.error ?? "Something went wrong.");
    setBusy(false);
  }

  return (
    <form
      action={handle}
      className="space-y-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={LABEL}>Amount ($)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={initial?.amount ?? ""}
            placeholder="15.00"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Currency</label>
          <input
            name="currency"
            defaultValue={initial?.currency ?? "USD"}
            maxLength={3}
            required
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <select
            name="category"
            required
            defaultValue={initial?.category ?? ""}
            className={SELECT}
          >
            <option value="" disabled className="bg-[#121214]">
              Select category…
            </option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#121214]">
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Description</label>
          <input
            name="description"
            required
            maxLength={200}
            defaultValue={initial?.description ?? ""}
            placeholder="TradingView subscription"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Vendor (optional)</label>
          <input
            name="vendor"
            maxLength={100}
            defaultValue={initial?.vendor ?? ""}
            placeholder="TradingView"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Spent at</label>
          <input
            name="spentAt"
            type="date"
            required
            defaultValue={initial ? toDateInput(initial.spentAt) : todayInput()}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Account link (optional)</label>
          <select
            name="accountId"
            defaultValue={initial?.accountId ?? ""}
            className={SELECT}
          >
            <option value="" className="bg-[#121214]">
              None
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#121214]">
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            id="isRecurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500"
          />
          <label htmlFor="isRecurring" className="text-sm text-zinc-300">
            Recurring expense
          </label>
        </div>
        {isRecurring && (
          <div>
            <label className={LABEL}>Recurrence</label>
            <select
              name="recurrence"
              required
              defaultValue={initial?.recurrence ?? "monthly"}
              className={SELECT}
            >
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r} value={r} className="bg-[#121214] capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <label className={LABEL}>Notes (optional)</label>
        <textarea
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={initial?.notes ?? ""}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-400 disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-zinc-500 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ExpenseCard({
  expense,
  accounts,
  index,
}: {
  expense: Expense;
  accounts: Account[];
  index: number;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const res = await deleteExpense(expense.id);
    setBusy(false);
    if (!res.success) return;

    const payload = res.deleted;
    // Undo recreates the row via createExpense — pragmatic for a low-stakes entity.
    // Trades use soft delete; expenses use recreate-on-undo.
    const { showUndoToast } = await import("@/lib/toast");
    showUndoToast({
      message: "Expense deleted.",
      onUndo: async () => {
        const fd = new FormData();
        (Object.entries(payload) as [keyof ExpensePayload, string | boolean | null][]).forEach(
          ([k, v]) => {
            if (v !== null && v !== undefined) fd.set(k, String(v));
          }
        );
        await createExpense(fd);
      },
    });
  }

  const amount = parseFloat(expense.amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-shadow duration-300 hover:shadow-[0_0_40px_-12px_rgba(244,63,94,0.15)]"
    >
      {editing ? (
        <ExpenseForm
          accounts={accounts}
          initial={expense}
          onSave={(fd) => updateExpense(expense.id, fd)}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-semibold tracking-tighter text-rose-400">
                -$<AnimatedNumber value={amount} decimals={2} />
              </div>
              <p className="mt-1 text-sm text-zinc-300 truncate">{expense.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-400">
                  {getCategoryLabel(expense.category as never)}
                </span>
                {expense.isRecurring && (
                  <RecurringBadge
                    recurrence={expense.recurrence}
                    amount={expense.amount}
                  />
                )}
              </div>
            </div>
            <div className="text-right text-xs text-zinc-500 shrink-0">
              {expense.vendor && (
                <p className="text-zinc-400">{expense.vendor}</p>
              )}
              <p>{formatRelative(expense.spentAt)}</p>
              <p className="text-zinc-600">{formatDate(expense.spentAt)}</p>
              {expense.accountName && (
                <p className="mt-1 text-zinc-500">{expense.accountName}</p>
              )}
            </div>
          </div>

          {expense.notes && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{expense.notes}</p>
          )}

          <div className="mt-4 flex items-center justify-end border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs text-zinc-500 transition-colors hover:text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="text-xs text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-50"
              >
                {busy ? "…" : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function ExpensesClient({
  expenses,
  stats,
  series,
  accounts,
  payoutsNet,
  realNetProfit,
}: {
  expenses: Expense[];
  stats: ExpenseStats;
  series: CumulativePoint[];
  accounts: Account[];
  payoutsNet: number;
  realNetProfit: number;
}) {
  const [showForm, setShowForm] = useState(false);

  const isProfit = realNetProfit >= 0;

  async function handleCreate(fd: FormData) {
    const res = await createExpense(fd);
    if (res.success) setShowForm(false);
    return res;
  }

  return (
    <>
      <UndoToast />
      <div className="space-y-6">
        {/* A. Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Expenses</h1>
          <p className="mt-2 text-[var(--muted)]">Every dollar out. No hiding.</p>
        </div>

        {/* B. Stats row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <MetricCard
            label="Total spent"
            value={<><span className="text-rose-400">$</span><AnimatedNumber value={stats.total} decimals={2} /></>}
            accent="rose"
            index={0}
          />
          <MetricCard
            label="Year to date"
            value={<><span className="text-zinc-400">$</span><AnimatedNumber value={stats.ytd} decimals={2} /></>}
            accent="zinc"
            index={1}
          />
          <MetricCard
            label="Month to date"
            value={<><span className="text-zinc-400">$</span><AnimatedNumber value={stats.mtd} decimals={2} /></>}
            accent="zinc"
            index={2}
          />
          <MetricCard
            label="Recurring monthly"
            value={<><span className="text-zinc-400">$</span><AnimatedNumber value={stats.recurringMonthly} decimals={2} /></>}
            hint="Fixed monthly burn"
            accent="zinc"
            index={3}
          />
        </div>

        {/* C. Real Net Profit card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-shadow duration-300",
            isProfit
              ? "shadow-[0_0_60px_-20px_rgba(16,185,129,0.2)]"
              : "shadow-[0_0_60px_-20px_rgba(244,63,94,0.2)]"
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Real Net Profit
          </p>
          <div
            className={cn(
              "mt-2.5 text-4xl font-bold tracking-tighter",
              isProfit ? "text-emerald-400" : "text-rose-400"
            )}
          >
            <AnimatedNumber
              value={Math.abs(realNetProfit)}
              prefix={isProfit ? "+$" : "-$"}
              decimals={2}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>
              Payouts net:{" "}
              <span className="text-emerald-400">
                +${payoutsNet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </span>
            <span className="text-zinc-700">·</span>
            <span>
              Expenses:{" "}
              <span className="text-rose-400">
                -${stats.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </span>
            <span className="text-zinc-700">·</span>
            <span>
              Net:{" "}
              <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                {isProfit ? "+" : "-"}$
                {Math.abs(realNetProfit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </span>
          </div>
        </motion.div>

        {/* D. Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
        >
          <div className="border-b border-white/[0.05] px-6 py-4">
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Category Breakdown
            </h3>
          </div>
          {stats.byCategory.length === 0 ? (
            <p className="px-6 py-8 text-xs text-zinc-600">No expenses logged yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                <div>Category</div>
                <div className="text-right">Count</div>
                <div className="text-right">Total</div>
                <div className="text-right">% of spend</div>
              </div>
              {stats.byCategory.map((row) => (
                <div
                  key={row.value}
                  className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-4 px-6 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="text-sm font-medium text-zinc-200">{row.label}</div>
                  <div className="text-right text-sm tabular-nums text-zinc-500">
                    {row.count}
                  </div>
                  <div className="text-right text-sm font-semibold tabular-nums tracking-tight text-rose-400">
                    ${row.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-right text-sm tabular-nums text-zinc-400">
                    {stats.total > 0
                      ? ((row.total / stats.total) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* E. Cumulative spending chart */}
        {series.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
          >
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Cumulative spending
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                >
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1c1c1f" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#52525b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#52525b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={yFmt}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#fb7185"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#fb7185", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* F. Monthly totals */}
        {stats.byMonth.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
          >
            <div className="border-b border-white/[0.05] px-6 py-4">
              <h3 className="text-sm font-semibold tracking-tight text-white">
                Monthly Totals
              </h3>
            </div>
            <div className="divide-y divide-white/[0.03]">
              <div className="grid grid-cols-[2fr_1fr] gap-4 px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                <div>Month</div>
                <div className="text-right">Total</div>
              </div>
              {[...stats.byMonth].reverse().map((row) => (
                <div
                  key={row.month}
                  className="grid grid-cols-[2fr_1fr] gap-4 px-6 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="text-sm font-medium text-zinc-200">{row.month}</div>
                  <div className="text-right text-sm font-semibold tabular-nums tracking-tight text-rose-400">
                    ${row.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* G. Add expense form */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Log an expense
            </p>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
            >
              {showForm ? "Cancel" : "+ Add expense"}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 overflow-hidden"
              >
                <ExpenseForm
                  accounts={accounts}
                  onSave={handleCreate}
                  onCancel={() => setShowForm(false)}
                  submitLabel="Add expense"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* H. Expenses list */}
        {expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
            <p className="text-lg font-medium text-white">No expenses logged yet.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Even the small ones count.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {expenses.map((e, i) => (
                <ExpenseCard key={e.id} expense={e} accounts={accounts} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
