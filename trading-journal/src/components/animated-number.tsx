"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  className,
}: Props) {
  return (
    <NumberFlow
      value={value}
      prefix={prefix}
      suffix={suffix}
      format={{
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        notation: "standard",
      }}
      className={cn("tabular-nums tracking-tight", className)}
    />
  );
}