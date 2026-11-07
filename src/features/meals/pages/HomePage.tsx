import { useState } from "react";

import { MEALS } from "@/constants/meals";
import { summarizeDebts, useDebts, useUserBalance } from "@/features/accounts";
import { useCurrentUser, useRoom } from "@/features/rooms";
import type { Meal } from "@/types";
import { formatDateId, formatLongDate } from "@/utils/date";
import { getMealPrice, priceSelection } from "@/utils/meals";

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
  const { room } = useRoom();
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

  const { selection, saved, loaded, isDirty, saving, toggleMeal, submit } = useMealOrder(
    user,
    dateId
  );
  const order = priceSelection(selection, room.meals, saved);

  // The room's meals, plus any meal it has stopped that's still on your saved order.
  const visibleMeals = MEALS.filter((meal) => room.meals[meal].enabled || saved[meal]);

  const handleToggle = (meal: Meal) => {
    // Paid meals can't be removed (the due can't go below zero).
    // Until the due has loaded, the save itself still checks.
    if (
      selection[meal] &&
      balance !== null &&
      !canRemoveMeal(balance, selection, saved, meal, room.meals)
    ) {
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
          {visibleMeals.map((meal) => (
            <MealCard
              key={meal}
              meal={meal}
              price={getMealPrice(meal, room.meals, saved)}
              discontinued={!room.meals[meal].enabled}
              orders={dayOrders.filter((dayOrder) => dayOrder[meal])}
              currentUserId={user.uid}
              isSelected={selection[meal]}
              disabled={!loaded}
              onToggle={() => handleToggle(meal)}
            />
          ))}
        </div>

        <SaveBar
          dayLabel={dayLabel}
          order={order}
          isDirty={isDirty}
          saving={saving}
          onSave={handleSave}
        />
      </section>

      <PaidMealDialog notice={paidNotice} dayLabel={dayLabel} onClose={() => setPaidNotice(null)} />
    </div>
  );
}
