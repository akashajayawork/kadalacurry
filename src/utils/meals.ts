import { MEALS } from "@/constants/meals";
import type { Meal, MealPrices, MealSelection, MealSettings, PricedSelection } from "@/types";

/** The meals the house currently orders. */
export function getEnabledMeals(settings: MealSettings): Meal[] {
  return MEALS.filter((meal) => settings[meal].enabled);
}

/**
 * What one meal costs this person: the price it was ordered at if it's
 * already in their saved order, otherwise today's price.
 */
export function getMealPrice(
  meal: Meal,
  settings: MealSettings,
  saved?: PricedSelection | null
): number {
  return (saved?.[meal] ? saved.prices[meal] : undefined) ?? settings[meal].price;
}

/** The price of each selected meal (see getMealPrice). */
export function getOrderPrices(
  selection: MealSelection,
  settings: MealSettings,
  saved?: PricedSelection | null
): MealPrices {
  const prices: MealPrices = {};

  for (const meal of MEALS) {
    if (selection[meal]) prices[meal] = getMealPrice(meal, settings, saved);
  }

  return prices;
}

export function sumPrices(prices: MealPrices): number {
  return MEALS.reduce((total, meal) => total + (prices[meal] ?? 0), 0);
}

/** The selection with its prices and total, as it would be saved. */
export function priceSelection(
  selection: MealSelection,
  settings: MealSettings,
  saved?: PricedSelection | null
): PricedSelection {
  const prices = getOrderPrices(selection, settings, saved);
  return { ...selection, prices, amount: sumPrices(prices) };
}

export function countSelectedMeals(selection: MealSelection): number {
  return MEALS.filter((meal) => selection[meal]).length;
}
