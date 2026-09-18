"use client";

import { TradeCard } from "./trade-card";

type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  netPnl: string;
  strategy: string | null;
  notes: string | null;
  openedAt: Date;
  closedAt: Date;
};

export function JournalFeed({ trades }: { trades: Trade[] }) {
  return (
    <div className="flex flex-col gap-4">
      {trades.map((trade, index) => (
        <TradeCard key={trade.id} trade={trade} index={index} />
      ))}
    </div>
  );
}