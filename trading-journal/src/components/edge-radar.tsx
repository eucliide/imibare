"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { TradingMetrics } from "@/lib/analytics";

export function EdgeRadar({ metrics }: { metrics: TradingMetrics }) {
  // Normalize each metric to a 0-100 scale for the radar
  const data = [
    {
      axis: "Consistency",
      value: metrics.consistency,
    },
    {
      axis: "Win %",
      value: metrics.winRate,
    },
    {
      axis: "Profit Factor",
      value: Math.min((metrics.profitFactor / 3) * 100, 100),
    },
    {
      axis: "Avg Win/Loss",
      value: Math.min(
        (metrics.averageLoss > 0
          ? metrics.averageWin / metrics.averageLoss / 3
          : 1) * 100,
        100
      ),
    },
    {
      axis: "Recovery",
      value: Math.min((metrics.recoveryFactor / 5) * 100, 100),
    },
  ];

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}