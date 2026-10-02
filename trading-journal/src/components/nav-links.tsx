"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Link = { href: string; label: string };

export function NavLinks({
  primary,
  secondary,
}: {
  primary: Link[];
  secondary: Link[];
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const secondaryActive = secondary.some((l) => isActive(l.href));

  return (
    <div className="flex items-center gap-0.5">
      {primary.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-sm transition-colors",
            isActive(href)
              ? "text-white"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          )}
        >
          {isActive(href) && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-lg bg-white/[0.07]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            />
          )}
          <span className="relative">{label}</span>
        </a>
      ))}

      <NavMore links={secondary} anyActive={secondaryActive} />
    </div>
  );
}

function NavMore({ links, anyActive }: { links: Link[]; anyActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
          anyActive
            ? "bg-white/[0.07] text-white"
            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        )}
      >
        More
        <svg
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111113] py-1 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)]"
          >
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-2 text-sm transition-colors",
                  isActive(href)
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
