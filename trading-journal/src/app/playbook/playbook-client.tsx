"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createSetup, deleteSetup } from "./actions";
import { cn } from "@/lib/utils";

type Setup = {
  id: string;
  name: string;
  rules: string;
  createdAt: Date;
};

export function PlaybookClient({ setups }: { setups: Setup[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const result = await createSetup(formData);

    if (result.success) {
      (document.getElementById("setup-form") as HTMLFormElement)?.reset();
      setIsOpen(false);
    } else {
      setError(result.error || "Something went wrong.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* Toggle Form Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-6 py-4 text-left transition-colors hover:border-white/20"
      >
        <span className="text-sm font-medium text-white">
          {isOpen ? "Cancel" : "+ Add setup to playbook"}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg text-zinc-500"
        >
          +
        </motion.span>
      </button>

      {/* Collapsible Form */}
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
              id="setup-form"
              action={handleSubmit}
              className="space-y-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Setup name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. LONDON SWEEP + FVG"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Rules — one per line. Be specific.
                </label>
                <textarea
                  name="rules"
                  rows={6}
                  required
                  placeholder={`Liquidity swept above Asia high
Displacement through structure
Entry on FVG retrace
Stop beyond swept wick
Target: next H4 or D1 level`}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Add setup"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup List */}
      {setups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <p className="text-lg font-medium text-white">No setups yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Define your first strategy to start tagging trades.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {setups.map((setup, i) => (
              <SetupCard key={setup.id} setup={setup} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SetupCard({ setup, index }: { setup: Setup; index: number }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteSetup(setup.id);
  }

  // Split rules into bullet lines for rendering
  const rules = setup.rules
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6"
    >
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {setup.name}
        </h2>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-zinc-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-red-500/10 px-2 py-1 font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              {deleting ? "..." : "Confirm"}
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

      <ul className="mt-4 space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500/60" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}