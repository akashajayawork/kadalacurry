import { useEffect, useState } from "react";

import { useToast } from "@/components/feedback";
import { EMPTY_SELECTION, MEALS } from "@/constants/meals";
import { useRoom } from "@/features/rooms";
import {
  MealUnavailableError,
  PaidMealsError,
  saveOrder,
  subscribeToUserOrder,
} from "@/services/orderService";
import type { AppUser, Meal, MealSelection, PricedSelection } from "@/types";
import { priceSelection } from "@/utils/meals";

const NOTHING_SAVED: PricedSelection = { ...EMPTY_SELECTION, prices: {}, amount: 0 };

/** "paid": refused because it would remove meals that are already paid for. */
export type SaveResult = "saved" | "paid" | "failed" | "unchanged";

/**
 * The current user's meal selection for a date. Edits stay local (a draft per
 * date) until `submit` saves them to Firestore.
 */
export function useMealOrder(user: AppUser, dateId: string) {
  const { roomId, room } = useRoom();
  const { showToast } = useToast();
  const [savedByDate, setSavedByDate] = useState<Record<string, PricedSelection>>({});
  const [draftsByDate, setDraftsByDate] = useState<Record<string, MealSelection>>({});
  const [saving, setSaving] = useState(false);

  useEffect(
    () =>
      subscribeToUserOrder(
        roomId,
        dateId,
        user.uid,
        (order) => setSavedByDate((current) => ({ ...current, [dateId]: order })),
        (error) => console.error("Error loading saved order:", error)
      ),
    [roomId, dateId, user.uid]
  );

  // Until it loads, changes would start from an empty order and drop meals already ordered.
  const loaded = dateId in savedByDate;
  const saved = savedByDate[dateId] ?? NOTHING_SAVED;
  const selection: MealSelection = draftsByDate[dateId] ?? saved;
  const isDirty = MEALS.some((meal) => selection[meal] !== saved[meal]);

  const toggleMeal = (meal: Meal) => {
    if (!loaded) return;

    setDraftsByDate((current) => {
      const base = current[dateId] ?? saved;
      return { ...current, [dateId]: { ...pickSelection(base), [meal]: !base[meal] } };
    });
  };

  const discardDraft = () => {
    setDraftsByDate((current) => {
      const next = { ...current };
      delete next[dateId];
      return next;
    });
  };

  const submit = async (): Promise<SaveResult> => {
    if (!loaded || !isDirty || saving) return "unchanged";

    setSaving(true);

    try {
      await saveOrder(roomId, user, dateId, pickSelection(selection));
      // Show it as saved now; the listener confirms it a moment later.
      const savedOrder = priceSelection(pickSelection(selection), room.meals, saved);
      setSavedByDate((current) => ({ ...current, [dateId]: savedOrder }));
      discardDraft();
      return "saved";
    } catch (error) {
      if (error instanceof PaidMealsError) {
        // Go back to what's saved; the caller explains why.
        discardDraft();
        return "paid";
      }
      if (error instanceof MealUnavailableError) {
        discardDraft();
        showToast("The room admin just turned that meal off.", "error");
        return "failed";
      }
      console.error("Error submitting order:", error);
      showToast("Couldn't save your order. Please try again.", "error");
      return "failed";
    } finally {
      setSaving(false);
    }
  };

  return { selection, saved, loaded, isDirty, saving, toggleMeal, submit };
}

/** Just the yes/no per meal, without prices. */
function pickSelection(source: MealSelection): MealSelection {
  return { breakfast: source.breakfast, lunch: source.lunch, dinner: source.dinner };
}
