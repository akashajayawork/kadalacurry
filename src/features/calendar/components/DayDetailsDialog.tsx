import { Dialog, EasterEgg } from "@/components/ui";
import { MEAL_LABELS, MEAL_PRICES, MEALS } from "@/constants/meals";
import type { DailyOrder } from "@/types";
import { formatRupees } from "@/utils/currency";
import { formatLongDate, parseDateId } from "@/utils/date";

type DayDetailsDialogProps = {
  /** The day to show, or null when closed. */
  dateId: string | null;
  /** Every roommate's orders on that day. */
  orders: DailyOrder[];
  currentUserId: string;
  onClose: () => void;
};

/** Popup with who ordered what on a day. */
export function DayDetailsDialog({ dateId, orders, currentUserId, onClose }: DayDetailsDialogProps) {
  const activeOrders = orders.filter((order) => order.breakfast || order.lunch);
  const peopleCount = activeOrders.length;
  const dayTotal = activeOrders.reduce((total, order) => total + order.amount, 0);
  const myAmount = activeOrders.find((order) => order.userId === currentUserId)?.amount ?? 0;

  return (
    <Dialog open={dateId !== null} onClose={onClose} label="Day details">
      {dateId && (
        <div className="day-details">
          <h2 className="dialog-title">{formatLongDate(parseDateId(dateId))}</h2>
          <p className="dialog-text">
            {peopleCount === 0
              ? "No one ordered this day."
              : `${peopleCount} ${peopleCount === 1 ? "person" : "people"} ordered`}
          </p>

          {peopleCount === 0 ? (
            <div className="day-details-empty">
              <EasterEgg slot="calendar-empty-day" />
            </div>
          ) : (
            <>
              {MEALS.map((meal) => {
                const eaters = activeOrders.filter((order) => order[meal]);

                return (
                  <section key={meal} className="day-details-meal">
                    <div className="day-details-meal-header">
                      <span>
                        {MEAL_LABELS[meal]} · {eaters.length}
                      </span>
                      <span>{formatRupees(eaters.length * MEAL_PRICES[meal])}</span>
                    </div>

                    {eaters.length > 0 ? (
                      <ul className="name-chips">
                        {eaters.map((order) => (
                          <li
                            key={order.userId}
                            className={`name-chip ${order.userId === currentUserId ? "is-me" : ""}`}
                          >
                            {order.userId === currentUserId ? "You" : order.userName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="day-details-none">No {meal} orders</p>
                    )}
                  </section>
                );
              })}

              <div className="day-details-total">
                <span>Day total</span>
                <strong>{formatRupees(dayTotal)}</strong>
              </div>
              {myAmount > 0 && (
                <div className="day-details-mine">
                  <span>Your share</span>
                  <span>{formatRupees(myAmount)}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
