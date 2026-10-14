import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-zinc-300"
      >
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </label>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
