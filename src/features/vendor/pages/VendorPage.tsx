import type { CSSProperties } from "react";

import { Wordmark } from "@/components/ui";
import { MEAL_LABELS } from "@/constants/meals";
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

type VendorPageProps = {
  /** From the link: vendor.html?room=<roomId>. */
  roomId: string | null;
};

/**
 * Public page for a room's meal vendor (no sign-in): the house's due and
 * today's and tomorrow's meal counts.
 */
export function VendorPage({ roomId }: VendorPageProps) {
  return (
    <main className="vendor">
      <header className="vendor-header">
        <Wordmark />
      </header>

      {roomId ? (
        <VendorBoardView roomId={roomId} />
      ) : (
        <p className="vendor-note">
          This link is missing the house. Ask them for the vendor link from their room setup.
        </p>
      )}
    </main>
  );
}

function VendorBoardView({ roomId }: { roomId: string }) {
  const now = useNow();
  const { board, status } = useVendorBoard(roomId);

  // No board yet is "no numbers", not zero: never show the vendor a false 0.
  const isReady = status === "ready" && board !== null;
  const meals = board?.meals.length ? board.meals : (["breakfast", "lunch"] as const);

  return (
    <>
      {board?.roomName && <h1 className="vendor-room">{board.roomName}</h1>}

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

            <div
              className={`vendor-meals ${meals.length === 3 ? "is-three" : ""}`}
              style={{ "--meal-count": meals.length } as CSSProperties}
            >
              {meals.map((meal) => (
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
    </>
  );
}
