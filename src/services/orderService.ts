import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { EMPTY_SELECTION } from "@/constants/meals";
import type { AppUser, DailyOrder, MealSelection } from "@/types";
import { calculateOrderAmount } from "@/utils/meals";

const ordersCollection = collection(db, COLLECTIONS.dailyOrders);

/** Thrown when removing meals would take the due below zero: those meals are already paid for. */
export class PaidMealsError extends Error {
  constructor() {
    super("These meals are already paid for and can't be removed.");
    this.name = "PaidMealsError";
  }
}

const getOrderId = (dateId: string, uid: string) => `${dateId}_${uid}`;

function subscribeToOrders(
  constraints: QueryConstraint[],
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(ordersCollection, ...constraints),
    (snapshot) => {
      onChange(snapshot.docs.map((document) => document.data() as DailyOrder));
    },
    onError
  );
}

export function subscribeToOrdersOnDates(
  dateIds: string[],
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeToOrders([where("deliveryDate", "in", dateIds)], onChange, onError);
}

export function subscribeToOrdersInRange(
  startDateId: string,
  endDateId: string,
  onChange: (orders: DailyOrder[]) => void,
  onError?: (error: Error) => void
) {
  return subscribeToOrders(
    [where("deliveryDate", ">=", startDateId), where("deliveryDate", "<=", endDateId)],
    onChange,
    onError
  );
}

export function subscribeToUserOrder(
  dateId: string,
  uid: string,
  onChange: (selection: MealSelection) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, COLLECTIONS.dailyOrders, getOrderId(dateId, uid)),
    (snapshot) => {
      const order = snapshot.data();
      onChange({
        breakfast: order?.breakfast ?? false,
        lunch: order?.lunch ?? false,
      });
    },
    onError
  );
}

/**
 * Saves the user's order for a date and adjusts their outstanding balance by
 * the difference from any previously saved order, atomically.
 */
export async function saveOrder(
  user: AppUser,
  dateId: string,
  selection: MealSelection
): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.dailyOrders, getOrderId(dateId, user.uid));
  const userRef = doc(db, COLLECTIONS.users, user.uid);
  const roommateRef = doc(db, COLLECTIONS.roommates, user.uid);
  const userName = user.displayName || DEFAULT_ROOMMATE_NAME;
  const newAmount = calculateOrderAmount(selection);

  await runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);
    const userSnapshot = await transaction.get(userRef);
    const roommateSnapshot = await transaction.get(roommateRef);

    if (!userSnapshot.exists()) {
      throw new Error("Your approved user document could not be found.");
    }

    const oldOrder = (orderSnapshot.data() as MealSelection | undefined) ?? EMPTY_SELECTION;
    const oldAmount = calculateOrderAmount(oldOrder);
    const currentBalance = Number(userSnapshot.data().outstandingBalance ?? 0);
    const updatedBalance = currentBalance + newAmount - oldAmount;

    // The due is what's still unpaid. Removing more than that means removing
    // meals that are already paid for, so the due can never go below zero.
    if (newAmount < oldAmount && updatedBalance < 0) {
      throw new PaidMealsError();
    }

    transaction.set(orderRef, {
      userId: user.uid,
      userName,
      deliveryDate: dateId,
      breakfast: selection.breakfast,
      lunch: selection.lunch,
      amount: newAmount,
      status: "ordered",
      updatedAt: serverTimestamp(),
    });

    transaction.update(userRef, { outstandingBalance: updatedBalance });

    if (roommateSnapshot.exists()) {
      transaction.update(roommateRef, { outstandingBalance: updatedBalance });
    } else {
      transaction.set(roommateRef, { name: userName, outstandingBalance: updatedBalance });
    }
  });
}
