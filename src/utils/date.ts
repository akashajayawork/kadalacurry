const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a date as a local YYYY-MM-DD id (used as Firestore date keys). */
export function formatDateId(date: Date): string {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

/** Parses a YYYY-MM-DD id back into a local date. */
export function parseDateId(dateId: string): Date {
  const [year, month, day] = dateId.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** First and last date ids of the given month (month is 0-based). */
export function getMonthRange(year: number, month: number) {
  return {
    start: formatDateId(new Date(year, month, 1)),
    end: formatDateId(new Date(year, month, getDaysInMonth(year, month))),
  };
}

export function isToday(date: Date): boolean {
  return formatDateId(date) === formatDateId(new Date());
}

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/** "Saturday, 1 November" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

/** "Saturday, 1 November 2026" */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "1 Nov" */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "10:24 am" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** "November" */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "long" });
}
