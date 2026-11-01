import type { Meal, MealSelection } from "@/types";
import { addDays } from "@/utils/date";
import { calculateOrderAmount } from "@/utils/meals";

import type { OrderDay } from "./types";

export function getDeliveryDate(day: OrderDay): Date {
  return addDays(new Date(), day === "tomorrow" ? 1 : 0);
}

/**
 * Whether `meal` can be removed from the current selection. Mirrors the check
 * in saveOrder: removals may not take the due below zero, because anything
 * beyond the due is already paid for.
 *
 * @param due the saved due (what's still unpaid)
 * @param selection the current selection, including unsaved changes
 * @param saved the selection that's saved for this day
 */
export function canRemoveMeal(
  due: number,
  selection: MealSelection,
  saved: MealSelection,
  meal: Meal
): boolean {
  const newAmount = calculateOrderAmount({ ...selection, [meal]: false });
  const oldAmount = calculateOrderAmount(saved);

  return newAmount >= oldAmount || due + newAmount - oldAmount >= 0;
}
