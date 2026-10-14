import { Card } from "./card";
import Link from "next/link";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-zinc-600">{icon}</div>}
        <h3 className="text-lg font-semibold text-zinc-300">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
        {action && (
          <div className="mt-6">
            {action.href ? (
              <Link
                href={action.href}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
