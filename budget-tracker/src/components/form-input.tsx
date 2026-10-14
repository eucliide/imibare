import { cn } from "@/lib/utils";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function FormInput({ className, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
        className
      )}
      {...props}
    />
  );
}
