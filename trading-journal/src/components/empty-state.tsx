import Link from "next/link";

type Action =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

type Props = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: Action;
  variant?: "default" | "inline";
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: Props) {
  const isInline = variant === "inline";

  return (
    <div
      className={
        isInline
          ? "flex flex-col items-center justify-center py-8 text-center"
          : "flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[var(--card)] p-12 text-center"
      }
    >
      {icon && !isInline && (
        <div className="mb-5 inline-flex rounded-xl bg-white/5 p-3 text-zinc-500">
          {icon}
        </div>
      )}
      <p
        className={
          isInline
            ? "text-sm font-medium text-zinc-500"
            : "text-lg font-semibold tracking-tight text-white"
        }
      >
        {title}
      </p>
      <p
        className={
          isInline
            ? "mt-1 text-xs text-zinc-600"
            : "mt-2 max-w-sm text-sm text-zinc-500"
        }
      >
        {description}
      </p>
      {action && !isInline && (
        <div className="mt-6">
          {"href" in action ? (
            <Link
              href={action.href}
              className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
