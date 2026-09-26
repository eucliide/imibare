"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type Account = { id: string; name: string };

export function AccountSwitcher({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const current = searchParams.get("account");

  function select(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("account", id);
    } else {
      params.delete("account");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
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
        "flex-shrink-0 rounded-full px-4 py-1.5 text-sm transition-all",
        active
          ? "bg-emerald-500 font-medium text-black"
          : "border border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
      )}
    >
      {children}
    </button>
  );
}
