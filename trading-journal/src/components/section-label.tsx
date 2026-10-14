import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <h2
      className={cn(
        "text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500",
        className
      )}
    >
      {children}
    </h2>
  );
}
