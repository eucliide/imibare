"use client";

import NumberFlow from "@number-flow/react";

type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export function AnimatedNumber({ value, prefix, suffix, decimals = 2 }: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      format={{
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }}
      prefix={prefix}
      suffix={suffix}
    />
  );
}
