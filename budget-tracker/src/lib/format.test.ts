import { describe, it, expect } from "vitest";
import { formatCurrency, formatSignedCurrency, formatCompactCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats whole numbers with two decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats negative numbers", () => {
    expect(formatCurrency(-100)).toBe("-$100.00");
  });
});

describe("formatSignedCurrency", () => {
  it("adds a plus sign for positive amounts", () => {
    expect(formatSignedCurrency(100)).toBe("+$100.00");
  });

  it("adds a minus sign for negative amounts", () => {
    expect(formatSignedCurrency(-100)).toBe("-$100.00");
  });

  it("shows zero without a sign", () => {
    expect(formatSignedCurrency(0)).toBe("$0.00");
  });
});

describe("formatCompactCurrency", () => {
  it("formats large numbers with M suffix", () => {
    expect(formatCompactCurrency(1_500_000)).toBe("$1.5M");
  });

  it("formats thousands with k suffix", () => {
    expect(formatCompactCurrency(1_500)).toBe("$1.5k");
  });

  it("formats small numbers normally", () => {
    expect(formatCompactCurrency(500)).toBe("$500.00");
  });

  it("handles negative numbers", () => {
    expect(formatCompactCurrency(-2_000_000)).toBe("-$2M");
  });
});
