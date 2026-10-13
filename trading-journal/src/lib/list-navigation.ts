"use client";

import { useEffect, useState, useCallback } from "react";

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

type Options<T> = {
  items: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onOpen?: (item: T) => void;
  enabled?: boolean;
};

export function useListNavigation<T>({
  items,
  onEdit,
  onDelete,
  onOpen,
  enabled = true,
}: Options<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const reset = useCallback(() => {
    setFocusedIndex(-1);
    setConfirmingDelete(false);
  }, []);

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    function handleKey(e: KeyboardEvent) {
      if (isInputTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case "j":
        case "arrowdown": {
          e.preventDefault();
          setConfirmingDelete(false);
          setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
          break;
        }
        case "k":
        case "arrowup": {
          e.preventDefault();
          setConfirmingDelete(false);
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        }
        case "e": {
          if (focusedIndex < 0) break;
          e.preventDefault();
          onEdit?.(items[focusedIndex]);
          break;
        }
        case "d": {
          if (focusedIndex < 0) break;
          e.preventDefault();
          if (confirmingDelete) {
            onDelete?.(items[focusedIndex]);
            setConfirmingDelete(false);
          } else {
            setConfirmingDelete(true);
          }
          break;
        }
        case "enter": {
          if (focusedIndex < 0) break;
          if (confirmingDelete) {
            e.preventDefault();
            onDelete?.(items[focusedIndex]);
            setConfirmingDelete(false);
          } else {
            e.preventDefault();
            onOpen?.(items[focusedIndex]);
          }
          break;
        }
        case "escape": {
          setConfirmingDelete(false);
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, items, focusedIndex, confirmingDelete, onEdit, onDelete, onOpen]);

  // Reset when items change (e.g. after delete)
  useEffect(() => {
    setFocusedIndex((i) => Math.min(i, items.length - 1));
  }, [items.length]);

  return { focusedIndex, confirmingDelete, reset };
}
