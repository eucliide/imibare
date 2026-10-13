"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const G_MAP: Record<string, string> = {
  d: "/dashboard",
  l: "/log-trade",
  j: "/journal",
  p: "/playbook",
  b: "/breakdown",
  h: "/heatmap",
  r: "/review",
  f: "/performance",
  c: "/certificates",
  y: "/payouts",
  e: "/expenses",
  a: "/accounts",
};

function isInputTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

type Options = {
  onOpenPalette: () => void;
  onOpenHelp: () => void;
};

export function useGlobalShortcuts({ onOpenPalette, onOpenHelp }: Options) {
  const router = useRouter();
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearG = useCallback(() => {
    gPending.current = false;
    if (gTimer.current) clearTimeout(gTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl+K — open palette (let the palette component handle it too, but we stop here)
      if (isMeta && e.key === "k") {
        e.preventDefault();
        onOpenPalette();
        clearG();
        return;
      }

      // Ignore all other shortcuts when typing in inputs (unless Cmd/Ctrl)
      if (!isMeta && isInputTarget(e.target)) {
        clearG();
        return;
      }

      // Ignore modifier-only combos
      if (isMeta || e.altKey) return;

      const key = e.key.toLowerCase();

      // G-navigation: second key
      if (gPending.current) {
        clearG();
        const dest = G_MAP[key];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        // Any key (matching or not) cancels the G state
        return;
      }

      // Single-key shortcuts
      switch (key) {
        case "g": {
          e.preventDefault();
          gPending.current = true;
          // Show a subtle toast hint
          window.dispatchEvent(new CustomEvent("shortcut-g-pending"));
          gTimer.current = setTimeout(() => {
            clearG();
            window.dispatchEvent(new CustomEvent("shortcut-g-cancel"));
          }, 800);
          break;
        }
        case "n": {
          e.preventDefault();
          router.push("/log-trade");
          break;
        }
        case "?": {
          e.preventDefault();
          onOpenHelp();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearG();
    };
  }, [router, onOpenPalette, onOpenHelp, clearG]);
}
