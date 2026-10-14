import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  padded?: boolean;
  children: React.ReactNode;
};

export function Card({ className, padded = true, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-[var(--card)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
