import { useEffect, useState } from "react";

import { useToast } from "@/components/feedback";
import { EMPTY_SELECTION, MEALS } from "@/constants/meals";
import { PaidMealsError, saveOrder, subscribeToUserOrder } from "@/services/orderService";
import type { AppUser, Meal, MealSelection } from "@/types";

type SelectionsByDate = Record<string, MealSelection>;

/** "paid": refused because it would remove meals that are already paid for. */
export type SaveResult = "saved" | "paid" | "failed" | "unchanged";

/**
 * The current user's meal selection for a date. Edits stay local (a draft per
 * date) until `submit` saves them to Firestore.
 */
export function useMealOrder(user: AppUser, dateId: string) {
  const { showToast } = useToast();
  const [savedByDate, setSavedByDate] = useState<SelectionsByDate>({});
  const [draftsByDate, setDraftsByDate] = useState<SelectionsByDate>({});
  const [saving, setSaving] = useState(false);

  useEffect(
    () =>
      subscribeToUserOrder(
        dateId,
        user.uid,
        (selection) => setSavedByDate((current) => ({ ...current, [dateId]: selection })),
        (error) => console.error("Error loading saved order:", error)
      ),
    [dateId, user.uid]
  );

  const saved = savedByDate[dateId] ?? EMPTY_SELECTION;
  const selection = draftsByDate[dateId] ?? saved;
  const isDirty = MEALS.some((meal) => selection[meal] !== saved[meal]);

  const toggleMeal = (meal: Meal) => {
    setDraftsByDate((current) => {
      const base = current[dateId] ?? saved;
      return { ...current, [dateId]: { ...base, [meal]: !base[meal] } };
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
    if (!isDirty || saving) return "unchanged";

    setSaving(true);

    try {
      await saveOrder(user, dateId, selection);
      setSavedByDate((current) => ({ ...current, [dateId]: selection }));
      discardDraft();
      return "saved";
    } catch (error) {
      if (error instanceof PaidMealsError) {
        // Go back to what's saved; the caller explains why.
        discardDraft();
        return "paid";
      }
      console.error("Error submitting order:", error);
      showToast("Couldn't save your order. Please try again.", "error");
      return "failed";
    } finally {
      setSaving(false);
    }
  };

  return { selection, savedSelection: saved, isDirty, saving, toggleMeal, submit };
}
