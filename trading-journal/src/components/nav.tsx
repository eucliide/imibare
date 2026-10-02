import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/logout";
import { NavLinks } from "./nav-links";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log-trade", label: "Log Trade" },
  { href: "/journal", label: "Journal" },
  { href: "/playbook", label: "Playbook" },
  { href: "/breakdown", label: "Breakdown" },
];

const SECONDARY_LINKS = [
  { href: "/review", label: "Review" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/performance", label: "Performance" },
  { href: "/certificates", label: "Certificates" },
  { href: "/payouts", label: "Payouts" },
  { href: "/accounts", label: "Accounts" },
];

export async function Nav() {
  const { user } = await getCurrentUser();
  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[var(--background)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20 transition-all group-hover:bg-emerald-500/20">
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Journal
          </span>
        </a>

        {/* Links */}
        <NavLinks primary={PRIMARY_LINKS} secondary={SECONDARY_LINKS} />

        {/* Sign out */}
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
