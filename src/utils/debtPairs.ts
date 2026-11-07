import type { Debt } from "@/types";

/*
 * Each pair of roommates shares one debt record keyed `${uidA}_${uidB}`, with
 * the two ids sorted. `amount` is what users[0] owes users[1]; a negative
 * amount means users[1] owes users[0]. `names` keeps both names, so a debt
 * still reads right after one of them leaves the room.
 */

export type DebtRecord = {
  users: [string, string];
  amount?: unknown;
  names?: Record<string, unknown>;
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
  const nameOf = (userId: string) => {
    const name = data.names?.[userId];
    return typeof name === "string" ? name : null;
  };

  return uid === second
    ? { id, otherUserId: first, otherName: nameOf(first), amount }
    : { id, otherUserId: second, otherName: nameOf(second), amount: -amount };
}
