import { DEFAULT_MEAL_SETTINGS, MAX_MEAL_PRICE, MEALS } from "@/constants/meals";
import type { RoomSettings } from "@/types";
import { parseUpiTarget } from "@/utils/upi";

/** Why these settings can't be saved, or null if they can. Mirrors firestore.rules. */
export function getSettingsProblem(settings: RoomSettings): string | null {
  if (!MEALS.some((meal) => settings.meals[meal].enabled)) {
    return "Turn on at least one meal.";
  }

  const badPrice = MEALS.find((meal) => {
    const { enabled, price } = settings.meals[meal];
    return enabled && !(Number.isInteger(price) && price >= 1 && price <= MAX_MEAL_PRICE);
  });
  if (badPrice) return `Give ${badPrice} a price between ₹1 and ₹${MAX_MEAL_PRICE}.`;

  if (settings.vendorUpi.trim() && !parseUpiTarget(settings.vendorUpi)) {
    return "That doesn't look like a UPI ID (name@bank) or a 10-digit phone number.";
  }

  return null;
}

/** Ready to save: trims the UPI and gives meals that are off a valid price to keep. */
export function normalizeSettings(settings: RoomSettings): RoomSettings {
  const meals = { ...settings.meals };

  for (const meal of MEALS) {
    const { price } = meals[meal];
    if (!(Number.isInteger(price) && price >= 1 && price <= MAX_MEAL_PRICE)) {
      meals[meal] = { ...meals[meal], price: DEFAULT_MEAL_SETTINGS[meal].price };
    }
  }

  return { meals, vendorUpi: settings.vendorUpi.trim() };
}
