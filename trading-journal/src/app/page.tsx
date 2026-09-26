"use client";

import { motion } from "motion/react";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium tracking-wide text-zinc-400">
            Built for funded traders
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-2xl text-5xl font-bold tracking-tighter text-white sm:text-6xl lg:text-7xl">
          Your edge,{" "}
          <span className="text-emerald-400">quantified.</span>
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-500">
          Log trades, track your psychology, and find where your real edge lives — all in one place.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-3">
          <a
            href="/signup"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
          >
            Get started
          </a>
          <a
            href="/login"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Sign in
          </a>
        </div>
      </motion.div>

    </main>
  );
}
