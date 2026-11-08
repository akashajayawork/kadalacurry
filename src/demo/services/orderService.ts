// Demo stand-in for src/services/orderService.ts (same functions, in memory).
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { EMPTY_SELECTION, MEALS } from "@/constants/meals";
import type { AppUser, DailyOrder, MealSelection, PricedSelection } from "@/types";
import { priceSelection } from "@/utils/meals";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

export class PaidMealsError extends Error {
  constructor() {
    super("These meals are already paid for and can't be removed.");
    this.name = "PaidMealsError";
  }
}

export class MealUnavailableError extends Error {
  constructor() {
    super("That meal isn't being ordered any more.");
    this.name = "MealUnavailableError";
  }
}

const NOTHING_SAVED: PricedSelection = { ...EMPTY_SELECTION, prices: {}, amount: 0 };

const getOrderId = (dateId: string, uid: string) => `${dateId}_${uid}`;

export function subscribeToOrdersOnDates(
  _roomId: string,
  dateIds: string[],
  onChange: (orders: DailyOrder[]) => void
) {
  return watchDemoState((state) =>
    onChange(Object.values(state.orders).filter((order) => dateIds.includes(order.deliveryDate)))
  );
}

export function subscribeToOrdersInRange(
  _roomId: string,
  startDateId: string,
  endDateId: string,
  onChange: (orders: DailyOrder[]) => void
) {
  return watchDemoState((state) =>
    onChange(
      Object.values(state.orders).filter(
        (order) => order.deliveryDate >= startDateId && order.deliveryDate <= endDateId
      )
    )
  );
}

export function subscribeToUserOrder(
  _roomId: string,
  dateId: string,
  uid: string,
  onChange: (order: PricedSelection) => void
) {
  return watchDemoState((state) => onChange(state.orders[getOrderId(dateId, uid)] ?? NOTHING_SAVED));
}

/** Same rules as the real one: the due moves with the order and can't go below zero. */
export async function saveOrder(
  _roomId: string,
  user: AppUser,
  dateId: string,
  selection: MealSelection
): Promise<void> {
  await simulateLatency(150);

  updateDemoState((state) => {
    const member = state.members[user.uid];
    if (!member) throw new Error("You're not a member of this room.");

    const orderId = getOrderId(dateId, user.uid);
    const saved = state.orders[orderId] ?? NOTHING_SAVED;
    const { meals } = state.room;

    if (MEALS.some((meal) => selection[meal] && !saved[meal] && !meals[meal].enabled)) {
      throw new MealUnavailableError();
    }

    const order = priceSelection(selection, meals, saved);
    const updatedBalance = member.outstandingBalance + order.amount - saved.amount;

    if (order.amount < saved.amount && updatedBalance < 0) throw new PaidMealsError();

    state.orders[orderId] = {
      ...order,
      userId: user.uid,
      userName: user.displayName || DEFAULT_ROOMMATE_NAME,
      deliveryDate: dateId,
      status: "ordered",
    };
    member.outstandingBalance = updatedBalance;
  });
}
