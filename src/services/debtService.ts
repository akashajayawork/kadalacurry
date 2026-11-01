import { collection, onSnapshot, query, where, type DocumentData } from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import type { Debt } from "@/types";

/*
 * Each pair of roommates shares one document at debts/{uidA}_{uidB}, with the
 * two ids sorted. `amount` is what users[0] owes users[1]; a negative amount
 * means users[1] owes users[0].
 */

export function getDebtPair(uidA: string, uidB: string): [string, string] {
  return uidA < uidB ? [uidA, uidB] : [uidB, uidA];
}

export function getDebtId(uidA: string, uidB: string): string {
  return getDebtPair(uidA, uidB).join("_");
}

/** How the stored pair amount changes when `debtorId` owes `amount` more. */
export function getPairAmountChange(pair: [string, string], debtorId: string, amount: number) {
  return pair[0] === debtorId ? amount : -amount;
}

/** Converts a stored pair document to the given user's point of view. */
export function toDebt(uid: string, id: string, data: DocumentData): Debt {
  const [first, second] = data.users as [string, string];
  const amount = Number(data.amount ?? 0);

  return uid === second
    ? { id, otherUserId: first, amount }
    : { id, otherUserId: second, amount: -amount };
}

/** Real-time list of the user's non-zero debts with other roommates. */
export function subscribeToDebts(
  uid: string,
  onChange: (debts: Debt[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.debts), where("users", "array-contains", uid)),
    (snapshot) => {
      onChange(
        snapshot.docs
          .map((document) => toDebt(uid, document.id, document.data()))
          .filter((debt) => debt.amount !== 0)
      );
    },
    onError
  );
}
