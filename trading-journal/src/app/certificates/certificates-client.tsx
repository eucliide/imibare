"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { createCertificate, updateCertificate, deleteCertificate } from "./actions";
import type { CertificateStats, FirmGroup } from "@/lib/certificates";
import Link from "next/link";

type Account = { id: string; name: string };

type Cert = {
  id: string;
  firm: string;
  accountSize: string;
  profitTarget: string;
  maxDrawdown: string;
  phase: string;
  achievedAt: Date;
  certificateUrl: string | null;
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

function phasePill(phase: string) {
  if (phase === "funded")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (phase === "verification")
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
}

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

function CertForm({
  accounts,
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  accounts: Account[];
  initial?: Cert;
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
          <label className={LABEL}>Firm</label>
          <input name="firm" required defaultValue={initial?.firm ?? ""} placeholder="FTMO" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Phase</label>
          <select name="phase" required defaultValue={initial?.phase ?? "challenge"} className={SELECT}>
            <option value="challenge" className="bg-[#121214]">Challenge</option>
            <option value="verification" className="bg-[#121214]">Verification</option>
            <option value="funded" className="bg-[#121214]">Funded</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Account size ($)</label>
          <input name="accountSize" type="number" step="0.01" min="0.01" required defaultValue={initial?.accountSize ?? ""} placeholder="100000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Profit target hit ($)</label>
          <input name="profitTarget" type="number" step="0.01" min="0.01" required defaultValue={initial?.profitTarget ?? ""} placeholder="10000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Max drawdown allowed ($)</label>
          <input name="maxDrawdown" type="number" step="0.01" min="0.01" required defaultValue={initial?.maxDrawdown ?? ""} placeholder="5000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Achieved at</label>
          <input name="achievedAt" type="date" required defaultValue={initial ? toDateInput(initial.achievedAt) : ""} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Certificate URL (optional)</label>
          <input name="certificateUrl" type="url" defaultValue={initial?.certificateUrl ?? ""} placeholder="https://imgur.com/..." className={INPUT} />
          <p className="mt-1 text-[10px] text-zinc-600">Paste a link to your certificate screenshot — you can upload to Imgur or any host.</p>
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

function CertCard({ cert, accounts, index }: { cert: Cert; accounts: Account[]; index: number }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await deleteCertificate(cert.id);
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
        <CertForm
          accounts={accounts}
          initial={cert}
          onSave={(fd) => updateCertificate(cert.id, fd)}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-white">{cert.firm}</p>
                <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize tracking-wide", phasePill(cert.phase))}>
                  {cert.phase}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{formatRelative(cert.achievedAt)} · {formatDate(cert.achievedAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold tracking-tighter text-white">
                <AnimatedNumber value={parseFloat(cert.accountSize)} prefix="$" decimals={0} />
              </p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">account size</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Profit target hit</p>
              <p className="mt-0.5 font-medium text-emerald-400">
                +$<AnimatedNumber value={parseFloat(cert.profitTarget)} decimals={2} />
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-600 uppercase tracking-widest text-[10px]">Max drawdown</p>
              <p className="mt-0.5 font-medium text-rose-400">
                $<AnimatedNumber value={parseFloat(cert.maxDrawdown)} decimals={2} />
              </p>
            </div>
          </div>

          {cert.notes && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{cert.notes}</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4">
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span>Account: {cert.accountName}</span>
              {cert.certificateUrl && (
                <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                  View certificate →
                </a>
              )}
            </div>
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

export function CertificatesClient({
  certs,
  stats,
  firmGroups,
  accounts,
}: {
  certs: Cert[];
  stats: CertificateStats;
  firmGroups: FirmGroup[];
  accounts: Account[];
}) {
  const [showForm, setShowForm] = useState(false);
  const hasAccounts = accounts.length > 0;

  async function handleCreate(fd: FormData) {
    const res = await createCertificate(fd);
    if (res.success) setShowForm(false);
    return res;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Certificates</h1>
          <p className="mt-2 text-[var(--muted)]">Every challenge you&apos;ve passed.</p>
        </div>
        {hasAccounts && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            {showForm ? "Cancel" : "+ Add certificate"}
          </button>
        )}
      </div>

      {/* No accounts guard */}
      {!hasAccounts && (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <p className="text-lg font-medium text-white">You need an account first.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Certificates are linked to accounts.</p>
          <Link href="/accounts" className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400">
            Create an account →
          </Link>
        </div>
      )}

      {/* Stats row */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {[
            {
              label: "Total certificates",
              value: <AnimatedNumber value={stats.total} decimals={0} />,
              sub: (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats.byPhase.challenge > 0 && <span className="rounded-md border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-400">{stats.byPhase.challenge} challenge</span>}
                  {stats.byPhase.verification > 0 && <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">{stats.byPhase.verification} verification</span>}
                  {stats.byPhase.funded > 0 && <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">{stats.byPhase.funded} funded</span>}
                </div>
              ),
            },
            {
              label: "Total profit targets hit",
              value: <><span className="text-emerald-400">+$</span><AnimatedNumber value={stats.totalProfitTargetHit} decimals={2} /></>,
              sub: null,
            },
            {
              label: "Latest achievement",
              value: <span className="text-2xl font-semibold tracking-tighter text-white">{stats.latestAchievedAt ? formatDate(stats.latestAchievedAt) : "—"}</span>,
              sub: null,
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{card.label}</p>
              <div className="mt-2 text-3xl font-semibold tracking-tighter text-white">{card.value}</div>
              {card.sub}
            </motion.div>
          ))}
        </div>
      )}

      {/* Firm leaderboard */}
      {firmGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
        >
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">By firm</p>
          <div className="space-y-2">
            {firmGroups.map((g) => (
              <div key={g.firm} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
                <span className="font-medium text-white">{g.firm}</span>
                <span className="text-zinc-500">{g.count} cert{g.count !== 1 ? "s" : ""}</span>
                <span className="text-right text-zinc-400">${g.totalSize.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </motion.div>
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
            <CertForm
              accounts={accounts}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
              submitLabel="Add certificate"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {certs.length === 0 && hasAccounts ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-16 text-center">
          <p className="text-lg font-medium text-white">No certificates yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Pass a challenge and log it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {certs.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} accounts={accounts} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
