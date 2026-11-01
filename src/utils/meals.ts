import { MEAL_PRICES, MEALS } from "@/constants/meals";
import type { MealSelection } from "@/types";

export function calculateOrderAmount(selection: MealSelection): number {
  return MEALS.reduce(
    (total, meal) => total + (selection[meal] ? MEAL_PRICES[meal] : 0),
    0
  );
}

export function countSelectedMeals(selection: MealSelection): number {
  return MEALS.filter((meal) => selection[meal]).length;
}
