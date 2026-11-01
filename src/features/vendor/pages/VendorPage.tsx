import { Wordmark } from "@/components/ui";
import { MEAL_LABELS, MEALS } from "@/constants/meals";
import { useNow } from "@/hooks/useNow";
import { formatRupees } from "@/utils/currency";
import { addDays, formatDateId, formatLongDate } from "@/utils/date";

import { useVendorBoard } from "../hooks/useVendorBoard";
import "../vendor.css";

/** Public page for the meal vendor (no sign-in): the house's due and tomorrow's meal counts. */
export function VendorPage() {
  const now = useNow();
  const { board, status } = useVendorBoard();

  const tomorrow = addDays(now, 1);
  const counts = board?.days[formatDateId(tomorrow)];
  // No board yet is "no numbers", not zero: never show the vendor a false 0.
  const isReady = status === "ready" && board !== null;

  return (
    <main className="vendor">
      <header className="vendor-header">
        <Wordmark />
        <p className="vendor-date">Tomorrow · {formatLongDate(tomorrow)}</p>
      </header>

      <section className="vendor-due card" aria-label="Due">
        <p className="eyebrow">Due</p>
        <p className="vendor-due-amount">{isReady ? formatRupees(board?.totalDue ?? 0) : "–"}</p>
      </section>

      <div className="vendor-meals">
        {MEALS.map((meal) => (
          <section key={meal} className="vendor-meal card" aria-label={MEAL_LABELS[meal]}>
            <p className="vendor-meal-label">{MEAL_LABELS[meal]}</p>
            <p className="vendor-meal-count">{isReady ? (counts?.[meal] ?? 0) : "–"}</p>
          </section>
        ))}
      </div>

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
