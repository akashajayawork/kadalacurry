import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { MEAL_LABELS } from "@/constants/meals";
import { useRoom } from "@/features/rooms";
import type { MealSettings } from "@/types";
import { formatRupees } from "@/utils/currency";
import { getEnabledMeals } from "@/utils/meals";

import { useSaveRoomSettings } from "../hooks/useSaveRoomSettings";
import { CollapsibleSection } from "./CollapsibleSection";
import { MealSettingsFields } from "./MealSettingsFields";

/** Room admin: which meals the house orders and their prices. Can change any time. */
export function MealPricesForm() {
  const { room } = useRoom();
  const [meals, setMeals] = useState<MealSettings>(room.meals);
  const { save, saving, error } = useSaveRoomSettings();

  const isDirty = JSON.stringify(meals) !== JSON.stringify(room.meals);
  const summary = getEnabledMeals(room.meals)
    .map((meal) => `${MEAL_LABELS[meal]} ${formatRupees(room.meals[meal].price)}`)
    .join(" · ");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isDirty && !saving) void save({ meals });
  };

  return (
    <CollapsibleSection title="Meals & prices" summary={summary}>
      <form onSubmit={handleSubmit}>
        <p className="setup-hint setup-intro">
          A fixed price per person. New prices apply to meals ordered from now on.
        </p>

        <MealSettingsFields value={meals} onChange={setMeals} disabled={saving} />

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="button button-primary button-block setup-save"
          disabled={!isDirty || saving}
        >
          {saving ? <LoaderCircle size={18} className="spin" /> : isDirty ? "Save prices" : "Saved"}
        </button>
      </form>
    </CollapsibleSection>
  );
}
