"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/logout";

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/bills", label: "Bills" },
  { href: "/goals", label: "Goals" },
  { href: "/budgets", label: "Budgets" },
];

const secondaryLinks = [
  { href: "/accounts", label: "Accounts" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleSignOut() {
    await logout();
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-lg font-bold tracking-tight text-white"
          >
            Budget Tracker
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "font-medium text-white"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                More
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/[0.06] bg-[var(--card)] py-2 shadow-xl"
                  >
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                        Secondary
                      </p>
                    </div>
                    {secondaryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setDropdownOpen(false)}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors",
                          pathname === link.href
                            ? "font-medium text-white"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="my-2 border-t border-white/[0.06]" />
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-rose-400"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-zinc-400" />
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-64 border-l border-white/[0.06] bg-[var(--background)] p-6 md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} className="text-zinc-400" />
                </button>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                    Primary
                  </p>
                  <div className="space-y-2">
                    {primaryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block py-2 text-sm transition-colors",
                          pathname === link.href
                            ? "font-medium text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                    Secondary
                  </p>
                  <div className="space-y-2">
                    {secondaryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block py-2 text-sm transition-colors",
                          pathname === link.href
                            ? "font-medium text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
