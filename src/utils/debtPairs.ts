import type { Debt } from "@/types";

/*
 * Each pair of roommates shares one debt record keyed `${uidA}_${uidB}`, with
 * the two ids sorted. `amount` is what users[0] owes users[1]; a negative
 * amount means users[1] owes users[0].
 */

export type DebtRecord = {
  users: [string, string];
  amount?: unknown;
};

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

/** Converts a stored pair record to the given user's point of view. */
export function toDebt(uid: string, id: string, data: DebtRecord): Debt {
  const [first, second] = data.users;
  const amount = Number(data.amount ?? 0);

  return uid === second
    ? { id, otherUserId: first, amount }
    : { id, otherUserId: second, amount: -amount };
}
