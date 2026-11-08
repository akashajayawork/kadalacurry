// Demo stand-in for src/services/settlementService.ts (same functions, in memory).
import type { PaymentMethod, Person, Settlement, SettlementShare } from "@/types";
import { formatDateId } from "@/utils/date";
import { getDebtId, toDebt } from "@/utils/debtPairs";

import { addDebt } from "../ledger";
import {
  createDemoId,
  getDemoState,
  simulateLatency,
  updateDemoState,
  watchDemoState,
} from "../store";

export class NothingToSettleError extends Error {
  constructor() {
    super("There is nothing to settle.");
    this.name = "NothingToSettleError";
  }
}

export class DueChangedError extends Error {
  readonly total: number;

  constructor(total: number) {
    super("The total due changed while paying.");
    this.name = "DueChangedError";
    this.total = total;
  }
}

export function subscribeToRecentSettlements(
  _roomId: string,
  count: number,
  onChange: (settlements: Settlement[]) => void
) {
  return watchDemoState((state) => onChange([...state.settlements].reverse().slice(0, count)));
}

/** Every settlement, oldest first. */
export async function fetchAllSettlements(): Promise<Settlement[]> {
  await simulateLatency(150);
  return [...getDemoState().settlements];
}

/** The payer pays everyone's due; what others owed becomes a debt to the payer. */
export async function settleHouseholdBill(
  _roomId: string,
  payer: Person,
  paidVia: PaymentMethod,
  expectedTotal?: number
): Promise<number> {
  await simulateLatency(700);
  let total = 0;

  updateDemoState((state) => {
    const shares: SettlementShare[] = Object.entries(state.members)
      .filter(([, member]) => member.outstandingBalance !== 0)
      .map(([userId, member]) => ({ userId, name: member.name, amount: member.outstandingBalance }));

    total = shares.reduce((sum, share) => sum + share.amount, 0);
    if (total <= 0) throw new NothingToSettleError();
    if (expectedTotal !== undefined && total !== expectedTotal) throw new DueChangedError(total);

    const names = Object.fromEntries(
      Object.entries(state.members).map(([userId, member]) => [userId, member.name])
    );

    for (const share of shares) {
      state.members[share.userId].outstandingBalance = 0;
      if (share.userId !== payer.id) addDebt(state.debts, share.userId, payer.id, share.amount, names);
    }

    const now = new Date();
    state.settlements.push({
      id: createDemoId("bill"),
      kind: "bill",
      amount: total,
      paidBy: payer.id,
      paidByName: payer.name,
      paidVia,
      shares,
      createdBy: payer.id,
      createdByName: payer.name,
      dateId: formatDateId(now),
      createdAt: now,
    });
  });

  return total;
}

/** Clears what the two of them owe each other and logs the repayment. */
export async function settleDebt(_roomId: string, currentUser: Person, otherUser: Person): Promise<number> {
  await simulateLatency(600);
  let amount = 0;

  updateDemoState((state) => {
    const id = getDebtId(currentUser.id, otherUser.id);
    const record = state.debts[id];
    const owedToCurrentUser = record ? toDebt(currentUser.id, id, record).amount : 0;
    if (owedToCurrentUser === 0) throw new NothingToSettleError();

    const [from, to] = owedToCurrentUser > 0 ? [otherUser, currentUser] : [currentUser, otherUser];
    amount = Math.abs(owedToCurrentUser);
    record.amount = 0;

    const now = new Date();
    state.settlements.push({
      id: createDemoId("repay"),
      kind: "repayment",
      amount,
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      dateId: formatDateId(now),
      createdAt: now,
    });
  });

  return amount;
}
