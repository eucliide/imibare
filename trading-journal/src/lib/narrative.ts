import type { WeeklyStats } from "./weekly-stats";

const r2 = (n: number) => Math.round(n * 100) / 100;

function fmtMoney(n: number): string {
  return Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateWeeklyNarrative(
  stats: WeeklyStats,
  prev: WeeklyStats | null
): string[] {
  if (stats.totalTrades === 0) {
    return ["No trades this week. Sometimes the best trade is no trade."];
  }

  const lines: string[] = [];

  // ── Opening ──────────────────────────────────────────────────────────────
  const t = stats.totalTrades;
  const d = stats.tradingDays;
  lines.push(
    `You took ${t} ${t === 1 ? "trade" : "trades"} this week across ${d} trading ${d === 1 ? "day" : "days"}.`
  );

  // ── Net P&L ──────────────────────────────────────────────────────────────
  if (stats.netPnl > 0) {
    lines.push(`You finished up +$${fmtMoney(stats.netPnl)}.`);
  } else if (stats.netPnl < 0) {
    lines.push(`You finished down $${fmtMoney(Math.abs(stats.netPnl))}.`);
  } else {
    lines.push("You finished exactly flat.");
  }

  // ── Week-over-week comparison ─────────────────────────────────────────────
  if (prev && prev.totalTrades > 0 && prev.netPnl !== 0) {
    const diff = r2(stats.netPnl - prev.netPnl);
    const pct = Math.round(Math.abs(diff / prev.netPnl) * 100);
    if (diff > 0) {
      lines.push(`That's ${pct}% better than last week.`);
    } else if (diff < 0) {
      lines.push(`That's ${pct}% worse than last week.`);
    }
  }

  // ── Win rate ─────────────────────────────────────────────────────────────
  const decided = stats.wins + stats.losses;
  if (decided > 0) {
    lines.push(
      `You won ${stats.wins} of ${decided} decided ${decided === 1 ? "trade" : "trades"} — a ${stats.winRate.toFixed(1)}% win rate.`
    );
  }

  // ── Best / worst setup ───────────────────────────────────────────────────
  if (stats.bestStrategy && stats.bestStrategy.trades >= 2) {
    lines.push(
      `Your best setup was ${stats.bestStrategy.label} at +$${fmtMoney(stats.bestStrategy.pnl)} across ${stats.bestStrategy.trades} trades.`
    );
  }
  if (stats.worstStrategy && stats.worstStrategy.trades >= 2) {
    lines.push(
      `Consider revisiting ${stats.worstStrategy.label} — it lost $${fmtMoney(Math.abs(stats.worstStrategy.pnl))} across ${stats.worstStrategy.trades} trades.`
    );
  }

  // ── Biggest win / loss ───────────────────────────────────────────────────
  if (stats.biggestWin) {
    lines.push(
      `Your best single trade was ${stats.biggestWin.symbol} for +$${fmtMoney(stats.biggestWin.pnl)}.`
    );
  }
  if (stats.biggestLoss) {
    lines.push(
      `Your worst was ${stats.biggestLoss.symbol} at -$${fmtMoney(Math.abs(stats.biggestLoss.pnl))}.`
    );
  }

  // ── Streak ───────────────────────────────────────────────────────────────
  if (stats.currentStreak.type === "win" && stats.currentStreak.count >= 2) {
    lines.push(
      `You ended the week on a ${stats.currentStreak.count}-trade win streak.`
    );
  } else if (stats.currentStreak.type === "loss" && stats.currentStreak.count >= 2) {
    lines.push(
      `You ended the week on a ${stats.currentStreak.count}-trade losing streak — reset before next session.`
    );
  }

  // ── Behavioural insights ─────────────────────────────────────────────────
  if (d === 1 && t >= 3) {
    lines.push(
      "You took every trade in one session — watch for tilt."
    );
  }
  if (d >= 5) {
    lines.push("You traded every day this week. Take a rest day.");
  }
  if (stats.netPnl > 0 && stats.winRate < 40) {
    lines.push(
      "You're profitable on less than 40% wins — your risk management is doing the work."
    );
  }
  if (stats.netPnl < 0 && stats.winRate > 60) {
    lines.push(
      "You won more than you lost but still finished red — your losers are bigger than your winners. Tighten stops or scale back size."
    );
  }

  return lines;
}
