import type { Meal, MealSelection, MealSettings, PricedSelection } from "@/types";
import { addDays } from "@/utils/date";
import { priceSelection } from "@/utils/meals";

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
 * @param saved the order that's saved for this day
 */
export function canRemoveMeal(
  due: number,
  selection: MealSelection,
  saved: PricedSelection,
  meal: Meal,
  settings: MealSettings
): boolean {
  const newAmount = priceSelection({ ...selection, [meal]: false }, settings, saved).amount;

  return newAmount >= saved.amount || due + newAmount - saved.amount >= 0;
}
