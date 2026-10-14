/**
 * Currency formatting utilities
 */

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = "USD"): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 1_000_000) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(absAmount / 1_000_000)}M`.replace(".0M", "M");
  }

  if (absAmount >= 1_000) {
    return `${sign}${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(absAmount / 1_000)}k`.replace(".0k", "k");
  }

  return formatCurrency(amount, currency);
}

export function formatSignedCurrency(amount: number, currency = "USD"): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  if (amount > 0) {
    return `+${formatted}`;
  }
  if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}
