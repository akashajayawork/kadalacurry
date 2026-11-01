import type { Meal, MealSelection } from "@/types";

export const MEALS: readonly Meal[] = ["breakfast", "lunch"];

export const MEAL_PRICES: Record<Meal, number> = {
  breakfast: 50,
  lunch: 60,
};

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
};

export const EMPTY_SELECTION: MealSelection = {
  breakfast: false,
  lunch: false,
};
