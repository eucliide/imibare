// src/lib/toast.ts
// Minimal imperative toast trigger. Dispatches a custom DOM event that
// UndoToast listens to. Keeps server actions decoupled from UI state.

export type UndoToastPayload = {
  message: string;
  onUndo: () => void | Promise<void>;
};

export function showUndoToast(payload: UndoToastPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("undo-toast", { detail: payload }));
}
