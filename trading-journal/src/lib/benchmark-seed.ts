// Static S&P 500 monthly closes — last 24 months (end-of-month)
// Source: public historical data. Used as a static benchmark; no live API needed.
export const SP500_MONTHLY_CLOSES: { date: string; close: number }[] = [
  { date: "2023-06-30", close: 4450.38 },
  { date: "2023-07-31", close: 4588.96 },
  { date: "2023-08-31", close: 4507.66 },
  { date: "2023-09-29", close: 4288.05 },
  { date: "2023-10-31", close: 4193.80 },
  { date: "2023-11-30", close: 4567.80 },
  { date: "2023-12-29", close: 4769.83 },
  { date: "2024-01-31", close: 4845.65 },
  { date: "2024-02-29", close: 5096.27 },
  { date: "2024-03-28", close: 5254.35 },
  { date: "2024-04-30", close: 5035.69 },
  { date: "2024-05-31", close: 5277.51 },
  { date: "2024-06-28", close: 5460.48 },
  { date: "2024-07-31", close: 5522.30 },
  { date: "2024-08-30", close: 5648.40 },
  { date: "2024-09-30", close: 5762.48 },
  { date: "2024-10-31", close: 5705.45 },
  { date: "2024-11-29", close: 5998.74 },
  { date: "2024-12-31", close: 5881.63 },
  { date: "2025-01-31", close: 6040.53 },
  { date: "2025-02-28", close: 5954.23 },
  { date: "2025-03-31", close: 5611.85 },
  { date: "2025-04-30", close: 5569.06 },
  { date: "2025-05-30", close: 5911.69 },
];

export const SYMBOL_SP500 = "SPY";
