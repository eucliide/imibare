"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Account = { id: string; name: string };

export function AccountSwitcher({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const current = searchParams.get("account");

  function select(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("account", id);
    else params.delete("account");
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
      <Pill active={!current} onClick={() => select(null)}>
        All accounts
      </Pill>
      {accounts.map((a) => (
        <Pill key={a.id} active={current === a.id} onClick={() => select(a.id)}>
          {a.name}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
        active ? "text-black" : "border border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300"
      )}
    >
      {active && (
        <motion.span
          layoutId="account-pill"
          className="absolute inset-0 rounded-full bg-emerald-500"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
