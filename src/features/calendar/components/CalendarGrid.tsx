import { formatDateId, getDaysInMonth } from "@/utils/date";

import { CalendarDay } from "./CalendarDay";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type CalendarGridProps = {
  year: number;
  /** 0-based month. */
  month: number;
  onSelectDate: (dateId: string) => void;
  getAmountForDate: (dateId: string) => number;
};

export function CalendarGrid({ year, month, onSelectDate, getAmountForDate }: CalendarGridProps) {
  const leadingBlanks = new Date(year, month, 1).getDay();
  const days = Array.from(
    { length: getDaysInMonth(year, month) },
    (_, index) => new Date(year, month, index + 1)
  );

  return (
    <div className="calendar-grid">
      {WEEKDAYS.map((weekday, index) => (
        <div className="calendar-weekday" key={index} aria-hidden="true">
          {weekday}
        </div>
      ))}

      {Array.from({ length: leadingBlanks }, (_, index) => (
        <div key={`blank-${index}`} />
      ))}

      {days.map((date) => {
        const dateId = formatDateId(date);

        return (
          <CalendarDay
            key={dateId}
            date={date}
            amount={getAmountForDate(dateId)}
            onSelect={() => onSelectDate(dateId)}
          />
        );
      })}
    </div>
  );
}
