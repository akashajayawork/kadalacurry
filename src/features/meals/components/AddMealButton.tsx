import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { EASTER_EGGS } from "@/config/easterEggs";
import { MEAL_LABELS } from "@/constants/meals";
import type { Meal } from "@/types";
import { formatRupees } from "@/utils/currency";
import { tapFeedback } from "@/utils/haptics";

/** Floats up instead of the price when set (the "meal-added" easter egg). */
const ADDED_ART = EASTER_EGGS["meal-added"];

type AddMealButtonProps = {
  meal: Meal;
  price: number;
  isSelected: boolean;
  /** While the saved order is still loading. */
  disabled?: boolean;
  onToggle: () => void;
};

export function AddMealButton({ meal, price, isSelected, disabled = false, onToggle }: AddMealButtonProps) {
  // Bumped on every add so the celebration replays; reset when it finishes.
  const [celebration, setCelebration] = useState(0);
  const label = MEAL_LABELS[meal].toLowerCase();

  const handleClick = () => {
    if (isSelected) {
      tapFeedback(6);
    } else {
      setCelebration((count) => count + 1);
      tapFeedback(12);
    }
    onToggle();
  };

  return (
    <button
      type="button"
      className={`add-meal ${isSelected ? "is-added" : ""} ${celebration ? "is-celebrating" : ""}`}
      onClick={handleClick}
      aria-pressed={isSelected}
      disabled={disabled}
      aria-label={isSelected ? `Remove ${label}` : `Add ${label}`}
    >
      <span key={`icon-${celebration}`} className="add-meal-icon">
        {isSelected ? <Check size={18} strokeWidth={2.6} /> : <Plus size={18} strokeWidth={2.4} />}
      </span>
      <span>{isSelected ? "Added" : "Add"}</span>

      {celebration > 0 && (
        <span key={`fx-${celebration}`} aria-hidden="true">
          <span className="add-meal-ring" />
          <span className="add-meal-float" onAnimationEnd={() => setCelebration(0)}>
            {ADDED_ART ? (
              <img className="add-meal-float-art" src={ADDED_ART.src} alt="" draggable={false} />
            ) : (
              `+${formatRupees(price)}`
            )}
          </span>
        </span>
      )}
    </button>
  );
}
