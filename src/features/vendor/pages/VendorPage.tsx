import { Wordmark } from "@/components/ui";
import { MEAL_LABELS, MEALS } from "@/constants/meals";
import { useNow } from "@/hooks/useNow";
import { formatRupees } from "@/utils/currency";
import { addDays, formatDateId, formatLongDate } from "@/utils/date";

import { useVendorBoard } from "../hooks/useVendorBoard";
import "../vendor.css";

/** Shown top to bottom: today first, then tomorrow. */
const DAYS = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
] as const;

/** Public page for the meal vendor (no sign-in): the house's due and today's and tomorrow's meal counts. */
export function VendorPage() {
  const now = useNow();
  const { board, status } = useVendorBoard();

  // No board yet is "no numbers", not zero: never show the vendor a false 0.
  const isReady = status === "ready" && board !== null;

  return (
    <main className="vendor">
      <header className="vendor-header">
        <Wordmark />
      </header>

      <section className="vendor-due card" aria-label="Due">
        <p className="eyebrow">Due</p>
        <p className="vendor-due-amount">{isReady ? formatRupees(board?.totalDue ?? 0) : "–"}</p>
      </section>

      {DAYS.map(({ label, offset }) => {
        const date = addDays(now, offset);
        const counts = board?.days[formatDateId(date)];

        return (
          <section key={label} className="vendor-day" aria-label={label}>
            <h2 className="vendor-day-title">
              {label}
              <span className="vendor-day-date">{formatLongDate(date)}</span>
            </h2>

            <div className="vendor-meals">
              {MEALS.map((meal) => (
                <div key={meal} className="vendor-meal card">
                  <p className="vendor-meal-label">{MEAL_LABELS[meal]}</p>
                  <p className="vendor-meal-count">{isReady ? (counts?.[meal] ?? 0) : "–"}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {status === "ready" && board === null && (
        <p className="vendor-note">
          No numbers yet. They'll show up here as soon as someone in the house opens the app.
        </p>
      )}
      {status === "error" && (
        <p className="vendor-error">Couldn't load the numbers. Please refresh in a minute.</p>
      )}
    </main>
  );
}
