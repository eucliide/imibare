"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import FocusTrap from "focus-trap-react";
import {
  LayoutDashboard,
  PenLine,
  BookOpen,
  Library,
  BarChart2,
  Flame,
  CalendarCheck,
  TrendingUp,
  Award,
  Wallet,
  Receipt,
  CreditCard,
  Plus,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/app/actions/logout";
import { useGlobalShortcuts } from "@/lib/keyboard";
import { ShortcutsHelp } from "./shortcuts-help";
import { useMotionSafe } from "@/lib/motion-safe";

type Benchmark = { id: string; name: string };
type Account = { id: string; name: string };

type Props = {
  benchmarks: Benchmark[];
  accounts: Account[];
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hint: "G D" },
  { label: "Log Trade", href: "/log-trade", icon: PenLine, hint: "G L" },
  { label: "Journal", href: "/journal", icon: BookOpen, hint: "G J" },
  { label: "Playbook", href: "/playbook", icon: Library, hint: "G P" },
  { label: "Breakdown", href: "/breakdown", icon: BarChart2, hint: "G B" },
  { label: "Heatmap", href: "/heatmap", icon: Flame, hint: "G H" },
  { label: "Review", href: "/review", icon: CalendarCheck, hint: "G R" },
  { label: "Performance", href: "/performance", icon: TrendingUp, hint: "G F" },
  { label: "Certificates", href: "/certificates", icon: Award, hint: "G C" },
  { label: "Payouts", href: "/payouts", icon: Wallet, hint: "G Y" },
  { label: "Expenses", href: "/expenses", icon: Receipt, hint: "G E" },
  { label: "Accounts", href: "/accounts", icon: CreditCard, hint: "G A" },
];

const ACTION_ITEMS = [
  { label: "Log a new trade", href: "/log-trade", icon: PenLine },
  { label: "Add a playbook setup", href: "/playbook?new=1", icon: Library },
  { label: "Add a payout", href: "/payouts?new=1", icon: Wallet },
  { label: "Add an expense", href: "/expenses?new=1", icon: Receipt },
  { label: "Add a certificate", href: "/certificates?new=1", icon: Award },
  { label: "Create a new account", href: "/accounts?new=1", icon: CreditCard },
];

const AUTH_PAGES = ["/login", "/signup"];

export function CommandPalette({ benchmarks, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { durationFast, durationMed, ease, reduced } = useMotionSafe();

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  const openPalette = useCallback(() => {
    if (!isAuthPage) setOpen(true);
  }, [isAuthPage]);

  const closePalette = useCallback(() => setOpen(false), []);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  // Wire global keyboard shortcuts
  useGlobalShortcuts({ onOpenPalette: openPalette, onOpenHelp: openHelp });

  // Close palette on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // G-pending toast
  const [gPending, setGPending] = useState(false);
  useEffect(() => {
    function onPending() { setGPending(true); }
    function onCancel() { setGPending(false); }
    window.addEventListener("shortcut-g-pending", onPending);
    window.addEventListener("shortcut-g-cancel", onCancel);
    return () => {
      window.removeEventListener("shortcut-g-pending", onPending);
      window.removeEventListener("shortcut-g-cancel", onCancel);
    };
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  if (isAuthPage) return null;

  return (
    <>
      {/* G-pending toast */}
      <AnimatePresence>
        {gPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: durationFast, ease }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs text-zinc-400 shadow-xl"
          >
            Waiting for the second key…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts help */}
      <ShortcutsHelp open={helpOpen} onClose={closeHelp} />

      {/* Command palette */}
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
                onClick={closePalette}
                aria-hidden="true"
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: reduced ? 0 : durationMed, ease }}
                className="fixed inset-x-0 top-[12%] z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121214] shadow-2xl max-sm:mx-2 max-sm:rounded-xl"
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
              >
                <Command
                  className="flex flex-col"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closePalette();
                  }}
                >
                  {/* Input row */}
                  <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                    <svg
                      className="h-4 w-4 shrink-0 text-zinc-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <Command.Input
                      placeholder="Search or jump to…"
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={closePalette}
                      className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      Esc
                    </button>
                  </div>

                  {/* List */}
                  <Command.List className="no-scrollbar max-h-[400px] overflow-y-auto px-2 py-2">
                    <Command.Empty className="py-8 text-center text-sm text-zinc-600">
                      No results found.
                    </Command.Empty>

                    {/* Navigation */}
                    <Command.Group
                      heading="Navigation"
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500"
                    >
                      {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Command.Item
                            key={item.href}
                            value={item.label}
                            onSelect={() => navigate(item.href)}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-white hover:bg-white/5 hover:text-white focus-visible:outline-none"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                            <span className="flex-1">{item.label}</span>
                            <span className="font-mono text-[10px] text-zinc-600">
                              {item.hint}
                            </span>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>

                    {/* Actions */}
                    <Command.Group
                      heading="Actions"
                      className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500"
                    >
                      {ACTION_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Command.Item
                            key={item.href}
                            value={item.label}
                            onSelect={() => navigate(item.href)}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-white hover:bg-white/5 hover:text-white focus-visible:outline-none"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                            <span className="flex-1">{item.label}</span>
                            <ChevronRight className="h-3 w-3 text-zinc-700" />
                          </Command.Item>
                        );
                      })}

                      <Command.Item
                        value="Sign out"
                        onSelect={handleLogout}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-white hover:bg-white/5 hover:text-white focus-visible:outline-none"
                      >
                        <LogOut className="h-4 w-4 shrink-0 text-zinc-500" />
                        <span className="flex-1">Sign out</span>
                      </Command.Item>
                    </Command.Group>

                    {/* Benchmarks — only if user has any */}
                    {benchmarks.length > 0 && (
                      <Command.Group
                        heading="Benchmarks"
                        className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500"
                      >
                        {benchmarks.map((b) => (
                          <Command.Item
                            key={b.id}
                            value={`Switch benchmark ${b.name}`}
                            onSelect={() =>
                              navigate(`/performance?benchmark=${b.id}`)
                            }
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-white hover:bg-white/5 hover:text-white focus-visible:outline-none"
                          >
                            <TrendingUp className="h-4 w-4 shrink-0 text-zinc-500" />
                            <span className="flex-1">
                              Switch benchmark — {b.name}
                            </span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {/* Accounts — only if user has any */}
                    {accounts.length > 0 && (
                      <Command.Group
                        heading="Accounts"
                        className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-zinc-500"
                      >
                        {accounts.map((a) => (
                          <Command.Item
                            key={a.id}
                            value={`Open account ${a.name}`}
                            onSelect={() =>
                              navigate(`/dashboard?account=${a.id}`)
                            }
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-white hover:bg-white/5 hover:text-white focus-visible:outline-none"
                          >
                            <CreditCard className="h-4 w-4 shrink-0 text-zinc-500" />
                            <span className="flex-1">
                              Open account — {a.name}
                            </span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
}
