import { cn } from "@/lib/utils";

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

export function FormSelect({ className, children, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
