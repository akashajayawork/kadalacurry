import type { Meal, MealSelection, MealSettings } from "@/types";

/** Every meal a room can offer, in the order they're shown. */
export const MEALS: readonly Meal[] = ["breakfast", "lunch", "dinner"];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const EMPTY_SELECTION: MealSelection = {
  breakfast: false,
  lunch: false,
  dinner: false,
};

/** What a new room starts with. The room admin changes it in room setup. */
export const DEFAULT_MEAL_SETTINGS: MealSettings = {
  breakfast: { enabled: true, price: 50 },
  lunch: { enabled: true, price: 60 },
  dinner: { enabled: false, price: 60 },
};

/** The fixed prices of the original single-house app (v1), used when moving it into a room. */
export const V1_MEAL_SETTINGS: MealSettings = {
  breakfast: { enabled: true, price: 50 },
  lunch: { enabled: true, price: 60 },
  dinner: { enabled: false, price: 60 },
};

/** Keep in step with isValidMeal() in firestore.rules. */
export const MAX_MEAL_PRICE = 5000;
