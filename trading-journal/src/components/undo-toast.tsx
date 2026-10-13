"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { UndoToastPayload } from "@/lib/toast";
import { useMotionSafe } from "@/lib/motion-safe";

export function UndoToast() {
  const [toast, setToast] = useState<UndoToastPayload | null>(null);
  const { durationMed, ease } = useMotionSafe();

  useEffect(() => {
    function handler(e: Event) {
      const payload = (e as CustomEvent<UndoToastPayload>).detail;
      setToast(payload);
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
    window.addEventListener("undo-toast", handler);
    return () => window.removeEventListener("undo-toast", handler);
  }, []);

  async function handleUndo() {
    if (!toast) return;
    await toast.onUndo();
    setToast(null);
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: durationMed, ease }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 px-5 py-3 shadow-xl"
        >
          <span className="text-sm text-zinc-300">{toast.message}</span>
          <button
            onClick={handleUndo}
            className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            Undo
          </button>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="text-xs text-zinc-600 hover:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
