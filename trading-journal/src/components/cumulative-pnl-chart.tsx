"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatPnl } from "@/lib/utils";

type Point = { date: string; pnl: number };

export function CumulativePnlChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
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
            tick={{ fill: "#52525b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v >= 0 ? "+" : ""}${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#121214",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#71717a" }}
            formatter={(value: number) => [formatPnl(value), "Cumulative"]}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#pnlGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}