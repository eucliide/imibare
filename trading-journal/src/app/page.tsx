"use client";

import { motion } from "motion/react";

function NavCard({
  title,
  description,
  href,
  accent,
  icon,
  index,
}: {
  title: string;
  description: string;
  href: string;
  accent: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accent}15, transparent 70%)`,
        }}
      />
      <div
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
        style={{ color: accent }}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-white/60 transition-colors group-hover:text-white">
        <span>Open</span>
        <span className="inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </motion.a>
  );
}

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl">
            Trading Journal
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Your edge, quantified.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <NavCard
            title="Dashboard"
            description="Metrics, edge score, and cumulative performance."
            href="/dashboard"
            accent="#10b981"
            index={0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <NavCard
            title="Log Trade"
            description="Record a trade with symbol, P&L, strategy, and notes."
            href="/log-trade"
            accent="#3b82f6"
            index={1}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <NavCard
            title="Journal"
            description="Your full trade history with context and reasoning."
            href="/journal"
            accent="#a855f7"
            index={2}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      </div>
    </main>
  );
}