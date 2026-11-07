import { MAX_MEAL_PRICE, MEAL_LABELS, MEALS } from "@/constants/meals";
import type { Meal, MealSettings } from "@/types";

import "../admin.css";

type MealSettingsFieldsProps = {
  value: MealSettings;
  onChange: (value: MealSettings) => void;
  disabled?: boolean;
};

/** Breakfast, lunch and dinner: whether the house orders each one, and its fixed price. */
export function MealSettingsFields({ value, onChange, disabled = false }: MealSettingsFieldsProps) {
  const update = (meal: Meal, change: Partial<MealSettings[Meal]>) =>
    onChange({ ...value, [meal]: { ...value[meal], ...change } });

  return (
    <ul className="meal-settings">
      {MEALS.map((meal) => {
        const setting = value[meal];
        const inputId = `meal-price-${meal}`;

        return (
          <li key={meal} className={`meal-setting ${setting.enabled ? "" : "is-off"}`}>
            <label className="switch">
              <input
                type="checkbox"
                role="switch"
                checked={setting.enabled}
                onChange={(event) => update(meal, { enabled: event.target.checked })}
                disabled={disabled}
              />
              <span className="switch-track" aria-hidden="true" />
              <span className="meal-setting-name">{MEAL_LABELS[meal]}</span>
            </label>

            <label className="price-field" htmlFor={inputId}>
              <span aria-hidden="true">₹</span>
              <input
                id={inputId}
                className="price-input"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_MEAL_PRICE}
                step={1}
                value={Number.isNaN(setting.price) ? "" : setting.price}
                onChange={(event) => update(meal, { price: event.target.valueAsNumber })}
                // Tapping a price selects it, so typing replaces it.
                onFocus={(event) => event.target.select()}
                disabled={disabled || !setting.enabled}
                aria-label={`${MEAL_LABELS[meal]} price in rupees`}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
