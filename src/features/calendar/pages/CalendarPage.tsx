import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { EasterEgg } from "@/components/ui";
import { useCurrentUser } from "@/features/rooms";
import { formatMonth } from "@/utils/date";

import { CalendarGrid } from "../components/CalendarGrid";
import { DayDetailsDialog } from "../components/DayDetailsDialog";
import { useMonthlyOrders } from "../hooks/useMonthlyOrders";
import "../calendar.css";

export function CalendarPage() {
  const user = useCurrentUser();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [openDateId, setOpenDateId] = useState<string | null>(null);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const orders = useMonthlyOrders(year, month);

  // The current user's meal cost keyed by date id.
  const myAmountByDate = useMemo(
    () =>
      new Map(
        orders
          .filter((order) => order.userId === user.uid)
          .map((order) => [order.deliveryDate, order.amount])
      ),
    [orders, user.uid]
  );

  const openDayOrders = orders.filter((order) => order.deliveryDate === openDateId);

  return (
    <div className="calendar">
      <header className="calendar-header">
        <div className="calendar-title">
          <div>
            <p className="eyebrow">{year}</p>
            <h1 className="page-title">{formatMonth(visibleMonth)}</h1>
          </div>
          <EasterEgg slot="calendar-header" />
        </div>

        <div className="calendar-nav">
          <button
            type="button"
            className="icon-button"
            onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="calendar-card card">
        <CalendarGrid
          key={`${year}-${month}`}
          year={year}
          month={month}
          onSelectDate={setOpenDateId}
          getAmountForDate={(dateId) => myAmountByDate.get(dateId) ?? 0}
        />
      </div>

      <DayDetailsDialog
        dateId={openDateId}
        orders={openDayOrders}
        currentUserId={user.uid}
        onClose={() => setOpenDateId(null)}
      />
    </div>
  );
}
