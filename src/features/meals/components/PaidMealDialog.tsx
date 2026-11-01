import { Lock } from "lucide-react";

import { Dialog, EasterEgg } from "@/components/ui";
import { MEAL_LABELS } from "@/constants/meals";
import type { Meal } from "@/types";

/** Which meal was refused, or null when it isn't known (e.g. refused on save). */
export type PaidNotice = { meal: Meal | null };

type PaidMealDialogProps = {
  notice: PaidNotice | null;
  dayLabel: string;
  onClose: () => void;
};

/** Explains why a paid meal can't be removed. */
export function PaidMealDialog({ notice, dayLabel, onClose }: PaidMealDialogProps) {
  const message = notice?.meal
    ? `${dayLabel}'s ${MEAL_LABELS[notice.meal].toLowerCase()} is already paid for, so it can't be removed.`
    : `Some of ${dayLabel.toLowerCase()}'s meals are already paid for, so they can't be removed.`;

  return (
    <Dialog open={notice !== null} onClose={onClose} label="Already paid">
      <div className="paid-notice">
        <span className="paid-notice-icon" aria-hidden="true">
          <Lock size={24} strokeWidth={2.2} />
        </span>
        <h2 className="dialog-title">Already paid</h2>
        <p className="dialog-text">{message}</p>
        <EasterEgg slot="meal-paid" />

        <div className="dialog-actions">
          <button type="button" className="button button-primary button-block" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </Dialog>
  );
}
