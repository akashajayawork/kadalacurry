import type { Meal } from "./order";

export type MealCounts = Record<Meal, number>;

/** Public numbers for the meal vendor. Only totals, never names. */
export type VendorBoard = {
  /** The house's total unpaid due. */
  totalDue: number;
  /** Meal counts keyed by date id (YYYY-MM-DD). */
  days: Record<string, MealCounts>;
  updatedAt: Date | null;
};
