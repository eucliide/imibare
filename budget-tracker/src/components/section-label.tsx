import { cn } from "@/lib/utils";

type SectionLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export function SectionLabel({ className, children }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500",
        className
      )}
    >
      {children}
    </p>
  );
}
