export const EXPENSE_CATEGORIES = [
  { value: "subscriptions", label: "Subscriptions" },
  { value: "challenges", label: "Prop Challenges" },
  { value: "vps", label: "VPS / Hosting" },
  { value: "data", label: "Data Feeds" },
  { value: "education", label: "Education" },
  { value: "tools", label: "Tools" },
  { value: "taxes", label: "Taxes" },
  { value: "other", label: "Other" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export const RECURRENCE_OPTIONS = ["monthly", "quarterly", "annual"] as const;
export type Recurrence = (typeof RECURRENCE_OPTIONS)[number];

export function getCategoryLabel(value: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
