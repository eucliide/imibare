import { motion } from "motion/react";
import { ProjectCube } from "@/components/project-cube";
import { ArrowRight } from "lucide-react";

// Replace /trading-preview.png and /budget-preview.png with real screenshots before launch.

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <motion.header
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Finance Hub
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tighter text-white sm:text-6xl">
          Two apps. One hub.
        </h1>
        <p className="mt-4 text-lg text-zinc-500">
          Pick a workspace to continue.
        </p>
      </motion.header>

      {/* Project grid */}
      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Trading Journal */}
        <div className="flex flex-col gap-4">
          <ProjectCube
            name="Trading Journal"
            description="Track trades, analyze performance, and build your playbook."
            href="https://trading.yourdomain.com"
            imageSrc="/trading-preview.png"
            imageAlt="Trading Journal preview"
            accent="emerald"
            index={0}
          />
          <a
            href="https://trading.yourdomain.com"
            className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-0 rounded-2xl"
          >
            <span>Open Trading Journal</span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* Budget Tracker */}
        <div className="flex flex-col gap-4">
          <ProjectCube
            name="Budget Tracker"
            description="Manage expenses, track income, and stay on top of your finances."
            href="https://budget.yourdomain.com"
            imageSrc="/budget-preview.png"
            imageAlt="Budget Tracker preview"
            accent="blue"
            index={1}
          />
          <a
            href="https://budget.yourdomain.com"
            className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0 rounded-2xl"
          >
            <span>Open Budget Tracker</span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
        © {currentYear} · Built for traders.
      </footer>
    </main>
  );
}
