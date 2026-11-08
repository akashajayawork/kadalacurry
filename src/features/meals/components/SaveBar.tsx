import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { ConfettiBurst } from "@/components/feedback";
import type { PricedSelection } from "@/types";
import { formatRupees } from "@/utils/currency";
import { tapFeedback } from "@/utils/haptics";
import { countSelectedMeals } from "@/utils/meals";

type SaveBarProps = {
  dayLabel: string;
  /** The current selection, priced. */
  order: PricedSelection;
  isDirty: boolean;
  saving: boolean;
  onSave: () => Promise<boolean>;
};

/** Order total plus the save button. Sticks above the tab bar while scrolling. */
export function SaveBar({ dayLabel, order, isDirty, saving, onSave }: SaveBarProps) {
  const [celebration, setCelebration] = useState(0);
  const mealCount = countSelectedMeals(order);

  const handleSave = async () => {
    if (await onSave()) {
      setCelebration((count) => count + 1);
      tapFeedback([10, 40, 14]);
    }
  };

  return (
    <div className={`save-bar ${isDirty ? "is-dirty" : ""}`}>
      <div className="save-bar-summary">
        <span className="save-bar-label">
          {dayLabel} · {mealCount} {mealCount === 1 ? "meal" : "meals"}
        </span>
        <strong className="save-bar-total">{formatRupees(order.amount)}</strong>
      </div>

      <button
        type="button"
        className={`button save-button ${isDirty ? "button-primary" : "is-saved"} ${
          celebration ? "is-celebrating" : ""
        }`}
        onClick={handleSave}
        disabled={!isDirty || saving}
      >
        {saving ? (
          <LoaderCircle size={18} className="spin" />
        ) : isDirty ? (
          "Save order"
        ) : (
          <>
            <span key={`check-${celebration}`} className="save-button-check">
              <Check size={18} strokeWidth={2.6} />
            </span>
            Saved
          </>
        )}
        {celebration > 0 && <ConfettiBurst key={`burst-${celebration}`} />}
      </button>
    </div>
  );
}
