import { forwardRef } from "react";

type Option = { value: string; label: string };

type FormSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  options: Option[];
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect({ options, placeholder, ...props }, ref) {
    return (
      <select
        ref={ref}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-[#121214]">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#121214]">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
