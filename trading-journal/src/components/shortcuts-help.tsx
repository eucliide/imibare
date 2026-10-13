"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import FocusTrap from "focus-trap-react";
import { useMotionSafe } from "@/lib/motion-safe";

type ShortcutRow = { keys: string[]; description: string };
type Group = { label: string; rows: ShortcutRow[] };

const GROUPS: Group[] = [
  {
    label: "Navigation",
    rows: [
      { keys: ["G", "D"], description: "Dashboard" },
      { keys: ["G", "L"], description: "Log Trade" },
      { keys: ["G", "J"], description: "Journal" },
      { keys: ["G", "P"], description: "Playbook" },
      { keys: ["G", "B"], description: "Breakdown" },
      { keys: ["G", "H"], description: "Heatmap" },
      { keys: ["G", "R"], description: "Review" },
      { keys: ["G", "F"], description: "Performance" },
      { keys: ["G", "C"], description: "Certificates" },
      { keys: ["G", "Y"], description: "Payouts" },
      { keys: ["G", "E"], description: "Expenses" },
      { keys: ["G", "A"], description: "Accounts" },
    ],
  },
  {
    label: "Actions",
    rows: [
      { keys: ["N"], description: "Log a new trade" },
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show this help" },
    ],
  },
  {
    label: "Lists",
    rows: [
      { keys: ["J"], description: "Move focus down" },
      { keys: ["K"], description: "Move focus up" },
      { keys: ["E"], description: "Edit focused item" },
      { keys: ["D"], description: "Delete focused item (press twice)" },
      { keys: ["↵"], description: "Open focused item" },
    ],
  },
  {
    label: "General",
    rows: [{ keys: ["Esc"], description: "Close dialog / cancel" }],
  },
];

function Keycap({ label }: { label: string }) {
  return (
    <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
      {label}
    </kbd>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ShortcutsHelp({ open, onClose }: Props) {
  const { durationFast, durationMed, ease, reduced } = useMotionSafe();

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <FocusTrap
          focusTrapOptions={{
            escapeDeactivates: false,
            allowOutsideClick: true,
          }}
        >
          <div>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: durationFast, ease }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: reduced ? 0 : durationMed, ease }}
              className="fixed inset-x-0 top-[10%] z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121214] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <span className="text-sm font-semibold text-white">
                  Keyboard shortcuts
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close shortcuts help"
                  className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-5">
                <div className="space-y-6">
                  {GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.rows.map((row) => (
                          <div
                            key={row.description}
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-zinc-400">
                              {row.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {row.keys.map((k) => (
                                <Keycap key={k} label={k} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}
