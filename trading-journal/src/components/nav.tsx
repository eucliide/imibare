import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/logout";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log-trade", label: "Log Trade" },
  { href: "/journal", label: "Journal" },
  { href: "/review", label: "Review" },
  { href: "/playbook", label: "Playbook" },
  { href: "/breakdown", label: "Breakdown" },
  { href: "/accounts", label: "Accounts" },
];

export async function Nav() {
  const { user } = await getCurrentUser();

  // No session → landing page or auth pages → render nothing
  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/dashboard" className="text-sm font-semibold tracking-tight text-white">
          Journal
        </a>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {label}
            </a>
          ))}

          <form action={logout} className="ml-2">
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
