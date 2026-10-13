"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import FocusTrap from "focus-trap-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/logout";
import { useMotionSafe } from "@/lib/motion-safe";

type Link = { href: string; label: string };

type Props = {
  primary: Link[];
  secondary: Link[];
};

export function MobileNav({ primary, secondary }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { durationMed, ease } = useMotionSafe();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

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
                transition={{ duration: 0.2, ease }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              {/* Sheet */}
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: durationMed, ease }}
                className="fixed inset-y-0 right-0 z-50 w-[280px] border-l border-white/[0.06] bg-[#121214] p-6 shadow-2xl"
              >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-white">
                      Journal
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
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

                {/* Primary links */}
                <div className="mb-4">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                    Primary
                  </p>
                  <div className="space-y-0.5">
                    {primary.map(({ href, label }) => (
                      <a
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(href)
                            ? "bg-white/[0.07] text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {label}
                        {isActive(href) && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Secondary links */}
                <div className="mb-6">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                    More
                  </p>
                  <div className="space-y-0.5">
                    {secondary.map(({ href, label }) => (
                      <a
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(href)
                            ? "bg-white/[0.07] text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {label}
                        {isActive(href) && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Sign out */}
                <div className="border-t border-white/[0.06] pt-4">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
}
