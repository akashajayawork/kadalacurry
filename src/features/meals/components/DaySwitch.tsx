import type { CSSProperties } from "react";

import type { OrderDay } from "../types";

const DAYS: { id: OrderDay; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
];

type DaySwitchProps = {
  value: OrderDay;
  onChange: (day: OrderDay) => void;
};

/** iOS-style segmented control with a sliding thumb. */
export function DaySwitch({ value, onChange }: DaySwitchProps) {
  const activeIndex = DAYS.findIndex((day) => day.id === value);

  return (
    <div
      className="segmented"
      role="tablist"
      aria-label="Order day"
      style={{ "--active-index": activeIndex } as CSSProperties}
    >
      <span className="segmented-thumb" aria-hidden="true" />

      {DAYS.map((day) => (
        <button
          key={day.id}
          type="button"
          role="tab"
          aria-selected={value === day.id}
          className={`segmented-option ${value === day.id ? "is-active" : ""}`}
          onClick={() => onChange(day.id)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
