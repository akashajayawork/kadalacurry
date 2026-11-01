import { formatRupees } from "@/utils/currency";
import { formatLongDate, isFutureDate, isToday } from "@/utils/date";

type CalendarDayProps = {
  date: Date;
  /** The current user's meal cost for this day. */
  amount: number;
  onSelect: () => void;
};

export function CalendarDay({ date, amount, onSelect }: CalendarDayProps) {
  const hasOrder = amount > 0;
  const label = hasOrder ? formatRupees(amount) : isFutureDate(date) ? "" : "–";

  return (
    <button
      type="button"
      className={`calendar-day ${isToday(date) ? "is-today" : ""} ${hasOrder ? "has-order" : ""}`}
      onClick={onSelect}
      aria-label={`${formatLongDate(date)}${hasOrder ? `, ${formatRupees(amount)}` : ""}`}
    >
      <span className="calendar-day-number">{date.getDate()}</span>
      <span className="calendar-day-amount">{label}</span>
    </button>
  );
}
