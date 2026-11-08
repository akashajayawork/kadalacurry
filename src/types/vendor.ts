import type { Meal } from "./order";

export type MealCounts = Record<Meal, number>;

/** Public numbers for a room's meal vendor. Only totals, never names. */
export type VendorBoard = {
  roomName: string;
  /** The meals the house orders, in order. */
  meals: Meal[];
  /** The house's total unpaid due. */
  totalDue: number;
  /** Meal counts keyed by date id (YYYY-MM-DD). */
  days: Record<string, MealCounts>;
  updatedAt: Date | null;
};

/** A change to the board, written by the roommates' apps. */
export type VendorBoardUpdate = Omit<VendorBoard, "days" | "updatedAt"> & {
  /** Counts to set. Other days on the board are left alone. */
  days: Record<string, MealCounts>;
  /** Days to take off the board. */
  removeDays: string[];
};
