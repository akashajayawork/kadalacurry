import { useState } from "react";

import { MEALS } from "@/constants/meals";
import { summarizeDebts, useDebts, useUserBalance } from "@/features/accounts";
import { useCurrentUser } from "@/features/auth";
import type { Meal } from "@/types";
import { formatDateId, formatLongDate } from "@/utils/date";

import { DaySwitch } from "../components/DaySwitch";
import { DueCard } from "../components/DueCard";
import { Greeting } from "../components/Greeting";
import { MealCard } from "../components/MealCard";
import { PaidMealDialog, type PaidNotice } from "../components/PaidMealDialog";
import { SaveBar } from "../components/SaveBar";
import { useMealOrder } from "../hooks/useMealOrder";
import { useOrdersOnDates } from "../hooks/useOrdersOnDates";
import type { OrderDay } from "../types";
import { canRemoveMeal, getDeliveryDate } from "../utils";
import "../meals.css";

export function HomePage() {
  const user = useCurrentUser();
  const balance = useUserBalance(user.uid);
  const { owedToYou, youOwe } = summarizeDebts(useDebts(user.uid));

  const [activeDay, setActiveDay] = useState<OrderDay>("today");
  const [paidNotice, setPaidNotice] = useState<PaidNotice | null>(null);
  const deliveryDate = getDeliveryDate(activeDay);
  const dateId = formatDateId(deliveryDate);
  const dayLabel = activeDay === "today" ? "Today" : "Tomorrow";

  const sharedOrders = useOrdersOnDates([
    formatDateId(getDeliveryDate("today")),
    formatDateId(getDeliveryDate("tomorrow")),
  ]);
  const dayOrders = sharedOrders.filter((order) => order.deliveryDate === dateId);

  const { selection, savedSelection, isDirty, saving, toggleMeal, submit } = useMealOrder(
    user,
    dateId
  );

  const handleToggle = (meal: Meal) => {
    // Paid meals can't be removed (the due can't go below zero).
    // Until the due has loaded, the save itself still checks.
    if (selection[meal] && balance !== null && !canRemoveMeal(balance, selection, savedSelection, meal)) {
      setPaidNotice({ meal });
      return;
    }
    toggleMeal(meal);
  };

  const handleSave = async () => {
    const result = await submit();
    if (result === "paid") setPaidNotice({ meal: null });
    return result === "saved";
  };

  return (
    <div className="home">
      <Greeting name={user.displayName} />
      <DueCard due={balance ?? 0} owedToYou={owedToYou} youOwe={youOwe} />

      <section className="meals" aria-labelledby="meals-title">
        <div className="meals-header">
          <h2 id="meals-title" className="section-title">
            Meals
          </h2>
          <DaySwitch value={activeDay} onChange={setActiveDay} />
          <p className="meals-date">{formatLongDate(deliveryDate)}</p>
        </div>

        <div className="meal-list">
          {MEALS.map((meal) => (
            <MealCard
              key={meal}
              meal={meal}
              orders={dayOrders.filter((order) => order[meal])}
              currentUserId={user.uid}
              isSelected={selection[meal]}
              onToggle={() => handleToggle(meal)}
            />
          ))}
        </div>

        <SaveBar
          dayLabel={dayLabel}
          selection={selection}
          isDirty={isDirty}
          saving={saving}
          onSave={handleSave}
        />
      </section>

      <PaidMealDialog notice={paidNotice} dayLabel={dayLabel} onClose={() => setPaidNotice(null)} />
    </div>
  );
}
