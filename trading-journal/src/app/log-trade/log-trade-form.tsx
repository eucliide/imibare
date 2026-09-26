"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { logTrade } from "./actions";
import { ChartUploader } from "@/components/chart-uploader";
import Link from "next/link";

type Account = { id: string; name: string };

export function LogTradeForm({
  accounts,
  defaultAccountId,
}: {
  accounts: Account[];
  defaultAccountId: string | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasAccounts = accounts.length > 0;
  const defaultId = defaultAccountId ?? accounts[0]?.id ?? "";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    const result = await logTrade(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Trade logged successfully." });
      setChartUrl(null);
      (document.getElementById("trade-form") as HTMLFormElement)?.reset();
    } else {
      setMessage({ type: "error", text: result.error || "Something went wrong." });
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tighter text-white">Log Trade</h1>
        <p className="mt-2 text-[var(--muted)]">Record a new trade with precision.</p>
      </motion.div>

      {!hasAccounts ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"
        >
          <p className="text-sm text-amber-400">
            You need an account before logging trades.{" "}
            <Link href="/accounts" className="font-medium underline hover:text-amber-300">
              Create one →
            </Link>
          </p>
        </motion.div>
      ) : (
        <motion.form
          id="trade-form"
          action={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8"
        >
          {/* Account select */}
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Account
            </label>
            <select
              name="accountId"
              required
              defaultValue={defaultId}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#121214]">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1: Symbol & Direction */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Symbol
              </label>
              <input
                name="symbol"
                required
                placeholder="EURUSD"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Direction
              </label>
              <select
                name="direction"
                required
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="LONG" className="bg-[#121214]">LONG</option>
                <option value="SHORT" className="bg-[#121214]">SHORT</option>
              </select>
            </div>
          </div>

          {/* Row 2: Outcome & Net P&L */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Outcome
              </label>
              <select
                name="outcome"
                required
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="WIN" className="bg-[#121214]">WIN</option>
                <option value="LOSS" className="bg-[#121214]">LOSS</option>
                <option value="BREAKEVEN" className="bg-[#121214]">BREAKEVEN</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Net P&L ($)
              </label>
              <input
                name="netPnl"
                type="number"
                step="0.01"
                required
                placeholder="4537.00"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Row 3: Dates */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Opened At
              </label>
              <input
                name="openedAt"
                type="datetime-local"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Closed At
              </label>
              <input
                name="closedAt"
                type="datetime-local"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Row 4: Strategy */}
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Strategy
            </label>
            <input
              name="strategy"
              placeholder="LONDON_SWEEP"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          {/* Row 5: Chart Screenshot */}
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Chart Screenshot
            </label>
            <ChartUploader value={chartUrl} onChange={setChartUrl} />
            <input type="hidden" name="chartUrl" value={chartUrl ?? ""} />
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Why (Journal Notes)
            </label>
            <textarea
              name="notes"
              rows={4}
              placeholder="Liquidity swept above Asia high. Displacement through structure. Entry on FVG retrace..."
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
              {isSubmitting ? "Logging..." : "Log Trade"}
            </button>

            {message && (
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-sm ${
                  message.type === "success" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {message.text}
              </motion.p>
            )}
          </div>
        </motion.form>
      )}
    </>
  );
}
