import {
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { ROOM_COLLECTIONS } from "@/constants/firestore";
import { MEALS } from "@/constants/meals";
import type { AppUser, DailyOrder, MealPrices, MealSelection, PricedSelection } from "@/types";
import { priceSelection } from "@/utils/meals";

import { roomCollection, roomDoc, roomRef } from "./refs";
import { toRoom } from "./roomService";

/** Thrown when removing meals would take the due below zero: those meals are already paid for. */
export class PaidMealsError extends Error {
  constructor() {
    super("These meals are already paid for and can't be removed.");
    this.name = "PaidMealsError";
  }
}

/** Thrown when adding a meal the room admin has just turned off. */
export class MealUnavailableError extends Error {
  constructor() {
    super("That meal isn't being ordered any more.");
    this.name = "MealUnavailableError";
  }
}

const getOrderId = (dateId: string, uid: string) => `${dateId}_${uid}`;

const ordersCollection = (roomId: string) => roomCollection(roomId, ROOM_COLLECTIONS.orders);

function toPricedSelection(data: DocumentData | undefined): PricedSelection {
  const prices: MealPrices = {};
  const selection = {} as MealSelection;

  for (const meal of MEALS) {
    selection[meal] = data?.[meal] === true;
    const price = data?.prices?.[meal];
    if (selection[meal] && typeof price === "number") prices[meal] = price;
  }

  return { ...selection, prices, amount: Number(data?.amount ?? 0) };
}

function toDailyOrder(data: DocumentData): DailyOrder {
  return {
    ...toPricedSelection(data),
    userId: String(data.userId ?? ""),
    userName: String(data.userName ?? DEFAULT_ROOMMATE_NAME),
    deliveryDate: String(data.deliveryDate ?? ""),
    status: typeof data.status === "string" ? data.status : undefined,
  };
}

function subscribeToOrders(
  roomId: string,
  constraints: QueryConstraint[],
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(ordersCollection(roomId), ...constraints),
    (snapshot) => {
      onChange(snapshot.docs.map((document) => toDailyOrder(document.data())));
    },
    onError
  );
}

export function subscribeToOrdersOnDates(
  roomId: string,
  dateIds: string[],
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeToOrders(roomId, [where("deliveryDate", "in", dateIds)], onChange, onError);
}

export function subscribeToOrdersInRange(
  roomId: string,
  startDateId: string,
  endDateId: string,
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeToOrders(
    roomId,
    [where("deliveryDate", ">=", startDateId), where("deliveryDate", "<=", endDateId)],
    onChange,
    onError
  );
}

/** The user's saved order for a date, with what each meal cost. */
export function subscribeToUserOrder(
  roomId: string,
  dateId: string,
  uid: string,
  onChange: (order: PricedSelection) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    roomDoc(roomId, ROOM_COLLECTIONS.orders, getOrderId(dateId, uid)),
    (snapshot) => onChange(toPricedSelection(snapshot.data())),
    onError
  );
}

/**
 * Saves the user's order for a date and moves their due by the difference
 * from the saved order, atomically. Prices come from the room as it is right
 * now; meals that stay on the order keep the price they were ordered at.
 */
export async function saveOrder(
  roomId: string,
  user: AppUser,
  dateId: string,
  selection: MealSelection
): Promise<void> {
  const orderRef = roomDoc(roomId, ROOM_COLLECTIONS.orders, getOrderId(dateId, user.uid));
  const memberRef = roomDoc(roomId, ROOM_COLLECTIONS.members, user.uid);
  const userName = user.displayName || DEFAULT_ROOMMATE_NAME;

  await runTransaction(db, async (transaction) => {
    const [roomSnapshot, orderSnapshot, memberSnapshot] = await Promise.all([
      transaction.get(roomRef(roomId)),
      transaction.get(orderRef),
      transaction.get(memberRef),
    ]);

    if (!roomSnapshot.exists() || !memberSnapshot.exists()) {
      throw new Error("You're not a member of this room.");
    }

    const { meals } = toRoom(roomSnapshot.id, roomSnapshot.data());
    const saved = toPricedSelection(orderSnapshot.data());

    if (MEALS.some((meal) => selection[meal] && !saved[meal] && !meals[meal].enabled)) {
      throw new MealUnavailableError();
    }

    const order = priceSelection(selection, meals, saved);
    const currentBalance = Number(memberSnapshot.data().outstandingBalance ?? 0);
    const updatedBalance = currentBalance + order.amount - saved.amount;

    // The due is what's still unpaid. Removing more than that means removing
    // meals that are already paid for, so the due can never go below zero.
    if (order.amount < saved.amount && updatedBalance < 0) {
      throw new PaidMealsError();
    }

    transaction.set(orderRef, {
      userId: user.uid,
      userName,
      deliveryDate: dateId,
      breakfast: order.breakfast,
      lunch: order.lunch,
      dinner: order.dinner,
      prices: order.prices,
      amount: order.amount,
      status: "ordered",
      updatedAt: serverTimestamp(),
    });

    transaction.update(memberRef, { outstandingBalance: updatedBalance });
  });
}
