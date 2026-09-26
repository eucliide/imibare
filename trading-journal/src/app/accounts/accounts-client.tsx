"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { formatCompactPnl } from "@/lib/utils";
import {
  createAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
} from "./actions";

type Account = {
  id: string;
  name: string;
  broker: string | null;
  startingBalance: string;
  currency: string;
  isArchived: boolean;
  currentBalance: number;
  tradeCount: number;
};

export function AccountsClient({ accounts }: { accounts: Account[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await createAccount(formData);
    if (result.success) {
      (document.getElementById("account-form") as HTMLFormElement)?.reset();
      setIsOpen(false);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
    setIsSubmitting(false);
  }

  const active = accounts.filter((a) => !a.isArchived);
  const archived = accounts.filter((a) => a.isArchived);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Accounts</h1>
          <p className="mt-2 text-[var(--muted)]">{active.length} active account{active.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
        >
          {isOpen ? "Cancel" : "+ New account"}
        </button>
      </div>

      {/* Collapsible form */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <form
              id="account-form"
              action={handleCreate}
              className="space-y-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Account name
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="FTMO 100k"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Broker / Firm (optional)
                  </label>
                  <input
                    name="broker"
                    placeholder="FTMO"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Starting balance
                  </label>
                  <input
                    name="startingBalance"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="100000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Currency
                  </label>
                  <input
                    name="currency"
                    defaultValue="USD"
                    maxLength={3}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active accounts */}
      {active.length === 0 && !isOpen ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
          <p className="text-lg font-medium text-white">No accounts yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Create your first account to start tracking your equity.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {active.map((account, i) => (
              <AccountCard key={account.id} account={account} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Archived accounts */}
      {archived.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Archived
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {archived.map((account, i) => (
              <AccountCard key={account.id} account={account} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountCard({ account, index }: { account: Account; index: number }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startingBalance = parseFloat(account.startingBalance);
  const netPnl = account.currentBalance - startingBalance;
  const isProfit = netPnl >= 0;

  async function handleArchive() {
    setBusy(true);
    await archiveAccount(account.id);
    setBusy(false);
  }

  async function handleUnarchive() {
    setBusy(true);
    await unarchiveAccount(account.id);
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    setDeleteError(null);
    const result = await deleteAccount(account.id);
    if (!result.success) {
      setDeleteError(result.error ?? "Cannot delete.");
      setConfirming(false);
    }
    setBusy(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">{account.name}</p>
          {account.broker && (
            <p className="text-xs text-zinc-500">{account.broker}</p>
          )}
        </div>
        {account.isArchived && (
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
            Archived
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Current balance
        </p>
        <div className={`mt-1 text-2xl font-semibold tracking-tighter ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
          <AnimatedNumber
            value={account.currentBalance}
            prefix={`${account.currency} `}
            decimals={2}
          />
        </div>
        <p className={`mt-0.5 text-xs ${isProfit ? "text-emerald-500" : "text-rose-500"}`}>
          {formatCompactPnl(netPnl)} since inception
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4">
        <div className="text-xs text-zinc-600">
          <span>Starting: ${startingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          <span className="mx-2">·</span>
          <span>{account.tradeCount} trade{account.tradeCount !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {deleteError && (
            <span className="max-w-[160px] text-right text-rose-400">{deleteError}</span>
          )}
          {!confirming ? (
            <>
              {account.isArchived ? (
                <button
                  onClick={handleUnarchive}
                  disabled={busy}
                  className="text-zinc-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100 disabled:opacity-30"
                >
                  Unarchive
                </button>
              ) : (
                <button
                  onClick={handleArchive}
                  disabled={busy}
                  className="text-zinc-500 opacity-0 transition-opacity hover:text-white group-hover:opacity-100 disabled:opacity-30"
                >
                  Archive
                </button>
              )}
              <button
                onClick={() => setConfirming(true)}
                className="text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                Delete
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={busy}
                className="rounded-md bg-red-500/10 px-2 py-1 font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                {busy ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md px-2 py-1 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
