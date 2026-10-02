"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { updateTrade } from "../../actions";
import { ChartUploader } from "@/components/chart-uploader";
import Link from "next/link";

type Account = { id: string; name: string };
type Setup = { id: string; name: string };
type Trade = {
  id: string;
  accountId: string;
  setupId: string | null;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  riskReward: string | null;
  openedAt: Date;
  closedAt: Date;
  strategy: string | null;
  notes: string | null;
  chartUrl: string | null;
};

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50";
const SELECT =
  "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50";
const LABEL =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500";

function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function EditTradeForm({
  trade,
  accounts,
  setups,
}: {
  trade: Trade;
  accounts: Account[];
  setups: Setup[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartUrl, setChartUrl] = useState<string | null>(trade.chartUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await updateTrade(trade.id, formData);
    if (result.success) {
      router.push("/journal");
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Edit Trade</h1>
          <p className="mt-2 text-[var(--muted)]">
            {trade.symbol} · {trade.direction}
          </p>
        </div>
        <Link
          href="/journal"
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Back
        </Link>
      </motion.div>

      <motion.form
        action={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8"
      >
        {/* Account */}
        <div>
          <label className={LABEL}>Account</label>
          <select name="accountId" required defaultValue={trade.accountId} className={SELECT}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#121214]">
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Playbook setup */}
        <div>
          <label className={LABEL}>Playbook setup</label>
          <select name="setupId" defaultValue={trade.setupId ?? ""} className={SELECT}>
            <option value="" className="bg-[#121214]">None</option>
            {setups.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#121214]">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Symbol & Direction */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={LABEL}>Symbol</label>
            <input
              name="symbol"
              required
              defaultValue={trade.symbol}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Direction</label>
            <select name="direction" required defaultValue={trade.direction} className={SELECT}>
              <option value="LONG" className="bg-[#121214]">LONG</option>
              <option value="SHORT" className="bg-[#121214]">SHORT</option>
            </select>
          </div>
        </div>

        {/* Outcome & Net P&L */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={LABEL}>Outcome</label>
            <select name="outcome" required defaultValue={trade.outcome} className={SELECT}>
              <option value="WIN" className="bg-[#121214]">WIN</option>
              <option value="LOSS" className="bg-[#121214]">LOSS</option>
              <option value="BREAKEVEN" className="bg-[#121214]">BREAKEVEN</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Net P&L ($)</label>
            <input
              name="netPnl"
              type="number"
              step="0.01"
              required
              defaultValue={trade.netPnl}
              className={INPUT}
            />
          </div>
        </div>

        {/* Risk/Reward */}
        <div>
          <label className={LABEL}>Risk / Reward (optional)</label>
          <input
            name="riskReward"
            type="number"
            step="0.01"
            defaultValue={trade.riskReward ?? ""}
            placeholder="2.50"
            className={INPUT}
          />
        </div>

        {/* Dates */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={LABEL}>Opened At</label>
            <input
              name="openedAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(new Date(trade.openedAt))}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Closed At</label>
            <input
              name="closedAt"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(new Date(trade.closedAt))}
              className={INPUT}
            />
          </div>
        </div>

        {/* Strategy tag */}
        <div>
          <label className={LABEL}>Strategy tag (optional)</label>
          <input
            name="strategy"
            defaultValue={trade.strategy ?? ""}
            placeholder="LONDON_SWEEP"
            className={INPUT}
          />
        </div>

        {/* Chart Screenshot */}
        <div>
          <label className={LABEL}>Chart Screenshot</label>
          <ChartUploader value={chartUrl} onChange={setChartUrl} />
          <input type="hidden" name="chartUrl" value={chartUrl ?? ""} />
        </div>

        {/* Notes */}
        <div>
          <label className={LABEL}>Journal Notes</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={trade.notes ?? ""}
            placeholder="What happened? Why did you take this trade?"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-500 px-8 py-3 font-medium text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.form>
    </>
  );
}
