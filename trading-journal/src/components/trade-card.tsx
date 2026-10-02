"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { cn, formatDate, formatTime, getOutcomeStyles } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { ChartLightbox } from "./chart-lightbox";
import { softDeleteTrade, duplicateTrade } from "@/app/journal/actions";

type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  strategy: string | null;
  setupName?: string | null;
  notes: string | null;
  chartUrl: string | null;
  openedAt: Date;
  closedAt: Date;
};

export function TradeCard({
  trade,
  index,
  selectable,
  selected,
  onSelect,
  onDeleted,
}: {
  trade: Trade;
  index: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const styles = getOutcomeStyles(trade.outcome);
  const date = formatDate(trade.closedAt);
  const time = formatTime(trade.closedAt);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await softDeleteTrade(trade.id);
    if (result.success) {
      onDeleted?.(trade.id);
    }
    setIsDeleting(false);
    setConfirmDelete(false);
  }

  async function handleDuplicate() {
    setIsDuplicating(true);
    const result = await duplicateTrade(trade.id);
    if (result.success && result.newId) {
      router.push(`/journal/${result.newId}/edit`);
    }
    setIsDuplicating(false);
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
        transition={{
          duration: 0.5,
          delay: Math.min(index * 0.05, 0.3),
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ y: selectable ? 0 : -2 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-white/[0.06] border-l-2 bg-[var(--card)] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] transition-all duration-300",
          styles.border,
          !selectable && "hover:" + styles.glow,
          selected && "ring-1 ring-emerald-500/40"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            styles.bg
          )}
        />

        {/* Checkbox for bulk select */}
        {selectable && (
          <button
            type="button"
            onClick={() => onSelect?.(trade.id)}
            className="absolute left-4 top-4 z-20 flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-white/5 transition-colors hover:border-emerald-500/50"
          >
            {selected && (
              <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 12 12">
                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        <div className={cn("relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between", selectable && "pl-8")}>
          <div className="flex-1">
            <div className={cn("text-3xl font-semibold tracking-tighter", styles.text)}>
              <AnimatedNumber
                value={Math.abs(parseFloat(trade.netPnl))}
                prefix={parseFloat(trade.netPnl) >= 0 ? "+$" : "-$"}
                decimals={2}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-zinc-500">
              <span>{date}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>{time}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span className="font-medium text-zinc-300">{trade.symbol}</span>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide",
                  trade.direction === "LONG"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                )}
              >
                {trade.direction}
              </span>

              {trade.setupName ? (
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400">
                  {trade.setupName}
                </span>
              ) : trade.strategy ? (
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-300">
                  {trade.strategy}
                </span>
              ) : null}
            </div>

            {trade.notes && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {trade.notes}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3">
            {trade.chartUrl && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group/thumb relative hidden overflow-hidden rounded-xl border border-white/10 transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_20px_-8px_rgba(255,255,255,0.15)] md:block"
                aria-label="View chart"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trade.chartUrl}
                  alt={`${trade.symbol} chart`}
                  className="h-20 w-[120px] object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover/thumb:bg-black/40">
                  <svg
                    className="h-5 w-5 text-white opacity-0 transition-opacity duration-200 group-hover/thumb:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            )}

            {/* Action buttons — visible on hover */}
            <div className="flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <a
                href={`/journal/${trade.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                title="Edit"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </a>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
                title="Duplicate"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
                title="Delete"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[var(--card)] p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white">Delete trade?</h3>
              <p className="mt-2 text-sm text-zinc-400">
                This trade will be soft-deleted. You can undo within 30 seconds.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {trade.chartUrl && (
        <ChartLightbox
          src={trade.chartUrl}
          alt={`${trade.symbol} chart`}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
