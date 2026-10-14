import { describe, it, expect } from "vitest";
import { formatPnl, formatCompactPnl, getOutcomeStyles } from "./utils";

describe("formatPnl", () => {
  it("formats positive with plus sign and commas", () => {
    expect(formatPnl(4537)).toBe("+$4,537.00");
  });

  it("formats negative with minus sign", () => {
    expect(formatPnl(-148)).toBe("-$148.00");
  });

  it("formats zero without sign", () => {
    expect(formatPnl(0)).toBe("$0.00");
  });

  it("handles decimals correctly", () => {
    expect(formatPnl(42.567)).toBe("+$42.57");
  });

  it("handles large numbers", () => {
    expect(formatPnl(1234567.89)).toBe("+$1,234,567.89");
  });

  it("handles string input", () => {
    expect(formatPnl("4537")).toBe("+$4,537.00");
  });
});

describe("formatCompactPnl", () => {
  it("formats thousands with k suffix", () => {
    expect(formatCompactPnl(4537)).toBe("+$4.5k");
  });

  it("formats millions with M suffix", () => {
    expect(formatCompactPnl(1234567)).toBe("+$1.2M");
  });

  it("formats small numbers without suffix", () => {
    expect(formatCompactPnl(42)).toBe("+$42");
  });

  it("handles negative numbers", () => {
    expect(formatCompactPnl(-2500)).toBe("-$2.5k");
  });

  it("handles zero", () => {
    expect(formatCompactPnl(0)).toBe("$0");
  });

  it("formats hundreds correctly", () => {
    expect(formatCompactPnl(876)).toBe("+$876");
  });
});

describe("getOutcomeStyles", () => {
  it("returns emerald for WIN", () => {
    const styles = getOutcomeStyles("WIN");
    expect(styles.text).toBe("text-emerald-400");
    expect(styles.border).toBe("border-l-emerald-500");
    expect(styles.bg).toBe("bg-emerald-500/[0.03]");
  });

  it("returns rose for LOSS", () => {
    const styles = getOutcomeStyles("LOSS");
    expect(styles.text).toBe("text-rose-400");
    expect(styles.border).toBe("border-l-rose-500");
    expect(styles.bg).toBe("bg-rose-500/[0.03]");
  });

  it("returns zinc for BREAKEVEN", () => {
    const styles = getOutcomeStyles("BREAKEVEN");
    expect(styles.text).toBe("text-zinc-400");
    expect(styles.border).toBe("border-l-zinc-600");
    expect(styles.bg).toBe("bg-zinc-500/[0.02]");
  });
});
