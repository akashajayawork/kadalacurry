import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { COLLECTIONS } from "@/constants/firestore";
import type { Person, Settlement, SettlementShare } from "@/types";
import { formatDateId } from "@/utils/date";

import { getDebtId, getDebtPair, getPairAmountChange, toDebt } from "./debtService";
import { toRoommate } from "./roommateService";

const settlementsCollection = collection(db, COLLECTIONS.settlements);

export class NothingToSettleError extends Error {
  constructor() {
    super("There is nothing to settle.");
    this.name = "NothingToSettleError";
  }
}

function toSettlement(id: string, data: DocumentData): Settlement {
  const base = {
    id,
    amount: Number(data.amount ?? 0),
    createdBy: String(data.createdBy ?? ""),
    createdByName: String(data.createdByName ?? DEFAULT_ROOMMATE_NAME),
    dateId: String(data.dateId ?? ""),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };

  if (data.kind === "repayment") {
    return {
      ...base,
      kind: "repayment",
      fromId: data.fromId,
      fromName: data.fromName,
      toId: data.toId,
      toName: data.toName,
    };
  }

  return {
    ...base,
    kind: "bill",
    paidBy: data.paidBy,
    paidByName: data.paidByName,
    shares: Array.isArray(data.shares) ? data.shares : [],
  };
}

export function subscribeToRecentSettlements(
  count: number,
  onChange: (settlements: Settlement[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(settlementsCollection, orderBy("createdAt", "desc"), limit(count)),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) =>
          // Estimate pending server timestamps so new entries show a time immediately.
          toSettlement(document.id, document.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

/** Every settlement, oldest first. */
export async function fetchAllSettlements(): Promise<Settlement[]> {
  const snapshot = await getDocs(query(settlementsCollection, orderBy("createdAt", "asc")));
  return snapshot.docs.map((document) => toSettlement(document.id, document.data()));
}

/**
 * The payer pays the whole household meal bill: every roommate's balance is
 * reset to zero and what they owed becomes a debt to the payer. Everything
 * happens in one transaction. Returns the total amount paid.
 */
export async function settleHouseholdBill(payer: Person): Promise<number> {
  const roommatesSnapshot = await getDocs(collection(db, COLLECTIONS.roommates));
  const members = roommatesSnapshot.docs.map((document) =>
    toRoommate(document.id, document.data())
  );
  const others = members.filter((member) => member.id !== payer.id);

  return runTransaction(db, async (transaction) => {
    // Transactions need every read before the first write.
    const [balanceSnapshots, debtSnapshots] = await Promise.all([
      Promise.all(
        members.map((member) => transaction.get(doc(db, COLLECTIONS.users, member.id)))
      ),
      Promise.all(
        others.map((member) =>
          transaction.get(doc(db, COLLECTIONS.debts, getDebtId(payer.id, member.id)))
        )
      ),
    ]);

    // users/{uid} is the source of truth for balances.
    const shares: SettlementShare[] = members.flatMap((member, index) => {
      const snapshot = balanceSnapshots[index];
      const amount = snapshot.exists() ? Number(snapshot.data().outstandingBalance ?? 0) : 0;
      return amount === 0 ? [] : [{ userId: member.id, name: member.name, amount }];
    });

    const total = shares.reduce((sum, share) => sum + share.amount, 0);
    if (total <= 0) throw new NothingToSettleError();

    transaction.set(doc(settlementsCollection), {
      kind: "bill",
      amount: total,
      paidBy: payer.id,
      paidByName: payer.name,
      shares,
      createdBy: payer.id,
      createdByName: payer.name,
      dateId: formatDateId(new Date()),
      createdAt: serverTimestamp(),
    });

    for (const share of shares) {
      transaction.update(doc(db, COLLECTIONS.users, share.userId), { outstandingBalance: 0 });
      transaction.update(doc(db, COLLECTIONS.roommates, share.userId), { outstandingBalance: 0 });

      if (share.userId === payer.id) continue;

      const debtSnapshot = debtSnapshots[others.findIndex((m) => m.id === share.userId)];
      const pair = getDebtPair(payer.id, share.userId);
      const currentAmount = debtSnapshot.exists() ? Number(debtSnapshot.data().amount ?? 0) : 0;

      transaction.set(debtSnapshot.ref, {
        users: pair,
        amount: currentAmount + getPairAmountChange(pair, share.userId, share.amount),
        updatedAt: serverTimestamp(),
      });
    }

    return total;
  });
}

/**
 * Records that whoever owed money in this pair has paid it back, clearing the
 * debt. Either roommate can record it. Returns the amount settled.
 */
export async function settleDebt(currentUser: Person, otherUser: Person): Promise<number> {
  const debtRef = doc(db, COLLECTIONS.debts, getDebtId(currentUser.id, otherUser.id));

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(debtRef);
    const owedToCurrentUser = snapshot.exists()
      ? toDebt(currentUser.id, snapshot.id, snapshot.data()).amount
      : 0;

    if (owedToCurrentUser === 0) throw new NothingToSettleError();

    const [from, to] =
      owedToCurrentUser > 0 ? [otherUser, currentUser] : [currentUser, otherUser];
    const amount = Math.abs(owedToCurrentUser);

    transaction.set(doc(settlementsCollection), {
      kind: "repayment",
      amount,
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      dateId: formatDateId(new Date()),
      createdAt: serverTimestamp(),
    });
    transaction.update(debtRef, { amount: 0, updatedAt: serverTimestamp() });

    return amount;
  });
}
