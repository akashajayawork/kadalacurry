import { ChevronDown, Coffee, Moon, Soup, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { EasterEgg } from "@/components/ui";
import { MEAL_LABELS } from "@/constants/meals";
import type { DailyOrder, Meal } from "@/types";
import { formatRupees } from "@/utils/currency";
import { getInitial } from "@/utils/name";

import { AddMealButton } from "./AddMealButton";

const MEAL_ICONS: Record<Meal, LucideIcon> = {
  breakfast: Coffee,
  lunch: Soup,
  dinner: Moon,
};

type MealCardProps = {
  meal: Meal;
  /** What it costs this person (the price it was ordered at, if already ordered). */
  price: number;
  /** Turned off by the room admin, but still on this person's saved order. */
  discontinued: boolean;
  /** Roommates who ordered this meal on the selected day. */
  orders: DailyOrder[];
  currentUserId: string;
  isSelected: boolean;
  /** True until the person's saved order has loaded, so a tap can't drop meals already ordered. */
  disabled: boolean;
  onToggle: () => void;
};

export function MealCard({
  meal,
  price,
  discontinued,
  orders,
  currentUserId,
  isSelected,
  disabled,
  onToggle,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const Icon = MEAL_ICONS[meal];

  return (
    <article className={`meal-card card ${isSelected ? "is-selected" : ""}`}>
      <div className="meal-card-row">
        <button
          type="button"
          className="meal-card-summary"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={listId}
        >
          <span className="meal-card-icon">
            <Icon size={22} strokeWidth={1.8} />
          </span>

          <span className="meal-card-text">
            <span className="meal-card-name">{MEAL_LABELS[meal]}</span>
            <span className="meal-card-meta">
              {formatRupees(price)} · {discontinued ? "no longer offered" : `${orders.length} ordered`}
              <ChevronDown size={15} className={`meal-card-chevron ${expanded ? "is-open" : ""}`} />
            </span>
          </span>
        </button>

        <AddMealButton
          meal={meal}
          price={price}
          isSelected={isSelected}
          disabled={disabled}
          onToggle={onToggle}
        />
      </div>

      {/* Dropdown: only the roommates who ordered. */}
      <div id={listId} className={`meal-card-orders ${expanded ? "is-open" : ""}`} inert={!expanded}>
        <div className="meal-card-orders-inner">
          {orders.length > 0 ? (
            <ul className="orderers">
              {orders.map((order) => (
                <li key={order.userId} className="orderer">
                  <span className="avatar">{getInitial(order.userName)}</span>
                  <span className="orderer-name">{order.userName}</span>
                  {order.userId === currentUserId && <span className="orderer-tag">You</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="orderers-empty">
              <EasterEgg slot="meal-empty" />
              <span>No one yet. Be the first!</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
