"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { signup } from "./actions";

const initialState = null;

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-white">
              Create account
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Start tracking your edge today.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[var(--card)] p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
            <form action={formAction} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-rose-400">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
              >
                {isPending ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-white transition-colors hover:text-emerald-400"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
