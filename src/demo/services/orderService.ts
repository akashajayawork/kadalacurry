// Demo stand-in for src/services/orderService.ts (same functions, in memory).
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { EMPTY_SELECTION } from "@/constants/meals";
import type { AppUser, DailyOrder, MealSelection } from "@/types";
import { calculateOrderAmount } from "@/utils/meals";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

export class PaidMealsError extends Error {
  constructor() {
    super("These meals are already paid for and can't be removed.");
    this.name = "PaidMealsError";
  }
}

const getOrderId = (dateId: string, uid: string) => `${dateId}_${uid}`;

export function subscribeToOrdersOnDates(dateIds: string[], onChange: (orders: DailyOrder[]) => void) {
  return watchDemoState((state) =>
    onChange(Object.values(state.orders).filter((order) => dateIds.includes(order.deliveryDate)))
  );
}

export function subscribeToOrdersInRange(
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
  dateId: string,
  uid: string,
  onChange: (selection: MealSelection) => void
) {
  return watchDemoState((state) => {
    const order = state.orders[getOrderId(dateId, uid)];
    onChange({ breakfast: order?.breakfast ?? false, lunch: order?.lunch ?? false });
  });
}

/** Same rules as the real one: the due moves with the order and can't go below zero. */
export async function saveOrder(user: AppUser, dateId: string, selection: MealSelection): Promise<void> {
  await simulateLatency();

  updateDemoState((state) => {
    const person = state.people[user.uid];
    if (!person) throw new Error("Your approved user document could not be found.");

    const orderId = getOrderId(dateId, user.uid);
    const oldAmount = calculateOrderAmount(state.orders[orderId] ?? EMPTY_SELECTION);
    const newAmount = calculateOrderAmount(selection);
    const updatedBalance = person.outstandingBalance + newAmount - oldAmount;

    if (newAmount < oldAmount && updatedBalance < 0) throw new PaidMealsError();

    state.orders[orderId] = {
      userId: user.uid,
      userName: user.displayName || DEFAULT_ROOMMATE_NAME,
      deliveryDate: dateId,
      breakfast: selection.breakfast,
      lunch: selection.lunch,
      amount: newAmount,
      status: "ordered",
    };
    person.outstandingBalance = updatedBalance;
  });
}
