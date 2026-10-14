import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  trades,
  playbookSetups,
  accounts,
  certificates,
  payouts,
  expenses,
  weeklyReviews,
  benchmarks,
  users,
} from "@/db/schema";

export type Trade = InferSelectModel<typeof trades>;
export type NewTrade = InferInsertModel<typeof trades>;
export type Setup = InferSelectModel<typeof playbookSetups>;
export type NewSetup = InferInsertModel<typeof playbookSetups>;
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;
export type Certificate = InferSelectModel<typeof certificates>;
export type NewCertificate = InferInsertModel<typeof certificates>;
export type Payout = InferSelectModel<typeof payouts>;
export type NewPayout = InferInsertModel<typeof payouts>;
export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;
export type WeeklyReview = InferSelectModel<typeof weeklyReviews>;
export type NewWeeklyReview = InferInsertModel<typeof weeklyReviews>;
export type Benchmark = InferSelectModel<typeof benchmarks>;
export type NewBenchmark = InferInsertModel<typeof benchmarks>;
export type User = InferSelectModel<typeof users>;
