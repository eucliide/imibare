"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion } from "motion/react";

type Point = { date: string; equity: number };

function yTickFormatter(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const equity = payload[0].value;
  return (
    <div className="rounded-lg border border-white/10 bg-[#121214] px-3 py-2 text-xs">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-0.5 font-medium text-white">
        ${equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function AccountBalanceChart({
  data,
  startingBalance,
}: {
  data: Point[];
  startingBalance: number;
}) {
  // Ensure Y-axis always includes startingBalance
  const equities = data.map((d) => d.equity);
  const allValues = [...equities, startingBalance];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || startingBalance * 0.05;
  const yDomain: [number, number] = [
    Math.floor(minVal - padding),
    Math.ceil(maxVal + padding),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="h-[320px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#1c1c1f" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: "#52525b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={yDomain}
            tick={{ fill: "#52525b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter}
            width={60}
          />

          <ReferenceLine
            y={startingBalance}
            stroke="#71717a"
            strokeDasharray="4 4"
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="equity"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
