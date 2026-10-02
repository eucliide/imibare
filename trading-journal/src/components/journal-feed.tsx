"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TradeCard } from "./trade-card";
import {
  bulkDeleteTrades,
  bulkRestoreTrades,
  bulkRetagTrades,
  bulkReassignAccount,
} from "@/app/journal/actions";

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

type Setup = { id: string; name: string };
type Account = { id: string; name: string };

type UndoEntry = {
  ids: string[];
  label: string;
  expiresAt: number;
};

export function JournalFeed({
  trades: initialTrades,
  setups = [],
  accounts = [],
}: {
  trades: Trade[];
  setups?: Setup[];
  accounts?: Account[];
}) {
  const [trades, setTrades] = useState(initialTrades);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [undoQueue, setUndoQueue] = useState<UndoEntry[]>([]);
  const [bulkAction, setBulkAction] = useState<"retag" | "reassign" | null>(null);
  const [bulkSetupId, setBulkSetupId] = useState("");
  const [bulkAccountId, setBulkAccountId] = useState("");
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const undoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Sync if parent re-renders with new data (e.g. after router.refresh)
  useEffect(() => {
    setTrades(initialTrades);
  }, [initialTrades]);

  // ── Undo toast cleanup ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      undoTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  function scheduleExpiry(ids: string[], label: string) {
    const key = ids.join(",");
    const expiresAt = Date.now() + 30_000;
    setUndoQueue((q) => [...q, { ids, label, expiresAt }]);

    const timer = setTimeout(() => {
      setUndoQueue((q) => q.filter((e) => e.ids.join(",") !== key));
      undoTimers.current.delete(key);
    }, 30_000);

    undoTimers.current.set(key, timer);
  }

  async function handleUndo(entry: UndoEntry) {
    const key = entry.ids.join(",");
    clearTimeout(undoTimers.current.get(key));
    undoTimers.current.delete(key);
    setUndoQueue((q) => q.filter((e) => e.ids.join(",") !== key));

    await bulkRestoreTrades(entry.ids);
    // Re-add restored trades to the list (they'll be at top since we don't know order)
    // Simplest: trigger a page refresh to re-fetch from server
    window.location.reload();
  }

  // ── Single trade deleted ────────────────────────────────────────────────────
  const handleSingleDeleted = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    scheduleExpiry([id], "1 trade deleted");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Selection ───────────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === trades.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(trades.map((t) => t.id)));
    }
  }

  // ── Bulk delete ─────────────────────────────────────────────────────────────
  async function handleBulkDelete() {
    const ids = [...selected];
    setIsBulkWorking(true);
    await bulkDeleteTrades(ids);
    setTrades((prev) => prev.filter((t) => !ids.includes(t.id)));
    setSelected(new Set());
    setBulkMode(false);
    scheduleExpiry(ids, `${ids.length} trade${ids.length > 1 ? "s" : ""} deleted`);
    setIsBulkWorking(false);
  }

  // ── Bulk retag ──────────────────────────────────────────────────────────────
  async function handleBulkRetag() {
    const ids = [...selected];
    setIsBulkWorking(true);
    await bulkRetagTrades(ids, bulkSetupId || null);
    setSelected(new Set());
    setBulkMode(false);
    setBulkAction(null);
    setIsBulkWorking(false);
    window.location.reload();
  }

  // ── Bulk reassign ───────────────────────────────────────────────────────────
  async function handleBulkReassign() {
    if (!bulkAccountId) return;
    const ids = [...selected];
    setIsBulkWorking(true);
    await bulkReassignAccount(ids, bulkAccountId);
    setSelected(new Set());
    setBulkMode(false);
    setBulkAction(null);
    setIsBulkWorking(false);
    window.location.reload();
  }

  return (
    <div className="relative">
      {/* Bulk mode toggle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {trades.length} {trades.length === 1 ? "trade" : "trades"}
        </span>
        <button
          type="button"
          onClick={() => {
            setBulkMode((v) => !v);
            setSelected(new Set());
            setBulkAction(null);
          }}
          className="text-xs text-zinc-500 transition-colors hover:text-white"
        >
          {bulkMode ? "Cancel" : "Select"}
        </button>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {bulkMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-[var(--card)] px-4 py-3"
          >
            <span className="text-sm font-medium text-white">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-zinc-500 hover:text-white"
            >
              {selected.size === trades.length ? "Deselect all" : "Select all"}
            </button>

            <div className="ml-auto flex flex-wrap gap-2">
              {setups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBulkAction(bulkAction === "retag" ? null : "retag")}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  Re-tag setup
                </button>
              )}
              {accounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => setBulkAction(bulkAction === "reassign" ? null : "reassign")}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  Reassign account
                </button>
              )}
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkWorking}
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {isBulkWorking ? "Working..." : "Delete"}
              </button>
            </div>

            {/* Inline retag picker */}
            {bulkAction === "retag" && (
              <div className="flex w-full items-center gap-2 pt-1">
                <select
                  value={bulkSetupId}
                  onChange={(e) => setBulkSetupId(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="" className="bg-[#121214]">None (remove tag)</option>
                  {setups.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#121214]">{s.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkRetag}
                  disabled={isBulkWorking}
                  className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Inline reassign picker */}
            {bulkAction === "reassign" && (
              <div className="flex w-full items-center gap-2 pt-1">
                <select
                  value={bulkAccountId}
                  onChange={(e) => setBulkAccountId(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="" className="bg-[#121214]">Select account…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#121214]">{a.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBulkReassign}
                  disabled={isBulkWorking || !bulkAccountId}
                  className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade list */}
      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {trades.map((trade, index) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              index={index}
              selectable={bulkMode}
              selected={selected.has(trade.id)}
              onSelect={toggleSelect}
              onDeleted={handleSingleDeleted}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Undo toast stack */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {undoQueue.map((entry) => (
            <UndoToast
              key={entry.ids.join(",")}
              entry={entry}
              onUndo={() => handleUndo(entry)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function UndoToast({
  entry,
  onUndo,
}: {
  entry: UndoEntry;
  onUndo: () => void;
}) {
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
      setRemaining(secs);
    }, 250);
    return () => clearInterval(interval);
  }, [entry.expiresAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
      className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-zinc-900 px-5 py-3 shadow-2xl"
    >
      <span className="text-sm text-zinc-300">{entry.label}</span>
      <button
        type="button"
        onClick={onUndo}
        className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
      >
        Undo
      </button>
      <span className="min-w-[2ch] text-right text-xs tabular-nums text-zinc-600">
        {remaining}s
      </span>
    </motion.div>
  );
}
