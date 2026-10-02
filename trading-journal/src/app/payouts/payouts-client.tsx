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
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { createPayout, updatePayout, deletePayout } from "./actions";
import type { PayoutStats, PayoutSeriesPoint } from "@/lib/payouts";
import Link from "next/link";

type Account = { id: string; name: string };

type Payout = {
  id: string;
  amount: string;
  fee: string;
  currency: string;
  method: string | null;
  receivedAt: Date;
  notes: string | null;
  accountId: string;
  accountName: string;
};

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50";
const SELECT =
  "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50";
const LABEL =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500";

function yFmt(v: number) {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-0.5 font-medium text-emerald-400">
        ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

function PayoutForm({
  accounts,
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  accounts: Account[];
  initial?: Payout;
  onSave: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(fd: FormData) {
    setBusy(true);
    setError(null);
    const res = await onSave(fd);
    if (!res.success) setError(res.error ?? "Something went wrong.");
    setBusy(false);
  }

  return (
    <form action={handle} className="space-y-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={LABEL}>Account</label>
          <select name="accountId" required defaultValue={initial?.accountId ?? ""} className={SELECT}>
            <option value="" disabled className="bg-[#121214]">Select account…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#121214]">{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Amount ($)</label>
          <input name="amount" type="number" step="0.01" min="0.01" required defaultValue={initial?.amount ?? ""} placeholder="5000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Fee withheld ($)</label>
          <input name="fee" type="number" step="0.01" min="0" defaultValue={initial?.fee ?? "0"} placeholder="0" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Currency</label>
          <input name="currency" defaultValue={initial?.currency ?? "USD"} maxLength={3} required className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Method</label>
          <select name="method" defaultValue={initial?.method ?? ""} className={SELECT}>
            <option value="" className="bg-[#121214]">None</option>
            <option value="bank" className="bg-[#121214]">Bank</option>
            <option value="crypto" className="bg-[#121214]">Crypto</option>
            <option value="wise" className="bg-[#121214]">Wise</option>
            <option value="paypal" className="bg-[#121214]">PayPal</option>
            <option value="other" className="bg-[#121214]">Other</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Received at</label>
          <input name="receivedAt" type="date" required defaultValue={initial ? toDateInput(initial.receivedAt) : ""} className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Notes (optional)</label>
        <textarea name="notes" rows={3} defaultValue={initial?.notes ?? ""} className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50">
          {busy ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-zinc-500 hover:text-white">Cancel</button>
      </div>
    </form>
  );
}

function PayoutCard({ payout, accounts, index }: { payout: Payout; accounts: Account[]; index: number }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const gross = parseFloat(payout.amount);
  const fee = parseFloat(payout.fee);
  const net = Math.round((gross - fee) * 100) / 100;

  async function handleDelete() {
    setBusy(true);
    await deletePayout(payout.id);
    setBusy(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-shadow duration-300 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.15)]"
    >
      {editing ? (
        <PayoutForm
          accounts={accounts}
          initial={payout}
          onSave={(fd) => updatePayout(payout.id, fd)}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-2xl font-semibold tracking-tighter text-emerald-400">
                +$<AnimatedNumber value={gross} decimals={2} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="text-zinc-400">Net: ${net.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                {payout.method && (
                  <span className="rounded-md border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] capitalize text-zinc-400">
                    {payout.method}
                  </span>
                )}
                <span>{formatRelative(payout.receivedAt)} · {formatDate(payout.receivedAt)}</span>
              </div>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>From {payout.accountName}</p>
              {fee > 0 && <p className="mt-0.5 text-rose-400">Fee: -${fee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>}
            </div>
          </div>

          {payout.notes && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{payout.notes}</p>
          )}

          <div className="mt-4 flex items-center justify-end border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {!confirming ? (
                <>
                  <button type="button" onClick={() => setEditing(true)} className="text-xs text-zinc-500 transition-colors hover:text-white">Edit</button>
                  <button type="button" onClick={() => setConfirming(true)} className="text-xs text-zinc-500 transition-colors hover:text-red-400">Delete</button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleDelete} disabled={busy} className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    {busy ? "…" : "Confirm"}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function PayoutsClient({
  payouts,
  stats,
  series,
  accounts,
}: {
  payouts: Payout[];
  stats: PayoutStats;
  series: PayoutSeriesPoint[];
  accounts: Account[];
}) {
  const [showForm, setShowForm] = useState(false);
  const hasAccounts = accounts.length > 0;

  async function handleCreate(fd: FormData) {
    const res = await createPayout(fd);
    if (res.success) setShowForm(false);
    return res;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Payouts</h1>
          <p className="mt-2 text-[var(--muted)]">Real cash, on the record.</p>
        </div>
        {hasAccounts && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            {showForm ? "Cancel" : "+ Add payout"}
          </button>
        )}
      </div>

      {/* No accounts guard */}
      {!hasAccounts && (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <p className="text-lg font-medium text-white">You need an account first.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Payouts are linked to accounts.</p>
          <Link href="/accounts" className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400">
            Create an account →
          </Link>
        </div>
      )}

      {/* Stats row */}
      {stats.count > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { label: "Total gross", value: <><span className="text-zinc-400">$</span><AnimatedNumber value={stats.totalGross} decimals={2} /></>, index: 0 },
            { label: "Total fees", value: <><span className="text-rose-400">-$</span><AnimatedNumber value={stats.totalFees} decimals={2} /></>, index: 1 },
            { label: "Total net", value: <><span className="text-emerald-400">$</span><AnimatedNumber value={stats.totalNet} decimals={2} /></>, index: 2 },
            { label: "Average net", value: <><span className="text-zinc-400">$</span><AnimatedNumber value={stats.averageNet} decimals={2} /></>, index: 3 },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: c.index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{c.label}</p>
              <div className="mt-2 text-3xl font-semibold tracking-tighter text-white">{c.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cumulative chart */}
      {series.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
        >
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Cumulative net payouts</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1f" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={yFmt} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={2} fill="url(#payoutGradient)" dot={false} activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* By method + by month */}
      {(stats.byMethod.length > 0 || stats.byMonth.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.byMethod.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
            >
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">By method</p>
              <div className="space-y-2">
                {stats.byMethod.map((m) => (
                  <div key={m.method} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                    <span className="capitalize text-white">{m.method}</span>
                    <span className="text-zinc-500">{m.count}</span>
                    <span className="text-right text-zinc-400">${m.net.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {stats.byMonth.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
            >
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">By month</p>
              <div className="space-y-2">
                {stats.byMonth.map((m) => (
                  <div key={m.month} className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
                    <span className="text-white">{m.month}</span>
                    <span className={cn("text-right font-medium", m.net >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {m.net >= 0 ? "+" : ""}${m.net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence initial={false}>
        {showForm && hasAccounts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <PayoutForm
              accounts={accounts}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              submitLabel="Add payout"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {payouts.length === 0 && hasAccounts ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
          <p className="text-lg font-medium text-white">No payouts yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">The first one is the sweetest.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {payouts.map((p, i) => (
              <PayoutCard key={p.id} payout={p} accounts={accounts} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
