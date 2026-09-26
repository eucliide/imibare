"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getUploadUrl } from "@/app/log-trade/get-upload-url";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ChartUploader({ value, onChange }: Props) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setState({ status: "validating" });

    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({ status: "error", message: "Only PNG, JPG, and WebP files are allowed." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setState({ status: "error", message: "File exceeds 5 MB limit." });
      return;
    }

    setState({ status: "uploading", progress: 0 });

    const result = await getUploadUrl(file.name, file.type);

    if (result.error) {
      setState({ status: "error", message: result.error });
      return;
    }

    try {
      // Simulate progress since fetch doesn't expose upload progress natively
      setState({ status: "uploading", progress: 30 });

      const res = await fetch(result.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) {
        throw new Error(`R2 responded with ${res.status}`);
      }

      setState({ status: "uploading", progress: 100 });

      // Small delay so the progress bar visually completes before transitioning
      await new Promise((r) => setTimeout(r, 300));

      setState({ status: "success" });
      onChange(result.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setState({ status: "error", message: "Upload failed. Try again." });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleReplace() {
    onChange(null);
    setState({ status: "idle" });
    // Reset the file input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Preview state (chart already uploaded) ────────────────────────────────
  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-white/10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Chart screenshot"
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
          <button
            type="button"
            onClick={handleReplace}
            className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 backdrop-blur-sm transition-colors hover:bg-rose-500/20"
          >
            Remove
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Upload zone ───────────────────────────────────────────────────────────
  const isUploading = state.status === "uploading" || state.status === "validating";

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 transition-colors duration-200",
          isDragging
            ? "border-emerald-500/30 bg-emerald-500/[0.03]"
            : "border-white/10 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]",
          isUploading && "pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleInputChange}
          tabIndex={-1}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-3"
            >
              <div className="text-xs text-zinc-500">
                {state.status === "validating" ? "Validating..." : "Uploading..."}
              </div>
              {/* Progress bar */}
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{
                    width: state.status === "validating"
                      ? "15%"
                      : `${(state as { status: "uploading"; progress: number }).progress}%`,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              {/* Upload icon */}
              <svg
                className="h-6 w-6 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm text-zinc-500">
                Drop chart screenshot or{" "}
                <span className="text-zinc-300">click to upload</span>
              </span>
              <span className="text-[11px] text-zinc-600">
                PNG, JPG, WebP · max 5 MB
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline error with retry */}
      <AnimatePresence>
        {state.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2"
          >
            <span className="text-xs text-rose-400">{state.message}</span>
            <button
              type="button"
              onClick={() => {
                setState({ status: "idle" });
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
