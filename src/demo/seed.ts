import type { AppUser, DailyOrder, Settlement, SettlementShare } from "@/types";
import { addDays, formatDateId } from "@/utils/date";
import { calculateOrderAmount } from "@/utils/meals";

import { addDebt } from "./ledger";
import type { DemoState } from "./store";

/*
 * The sample household. Everything is relative to today, so the "last five
 * days" are always the real last five days.
 */

const YOU = "demo-rohan";
const MEERA = "demo-meera";
const ARJUN = "demo-arjun";
const KABIR = "demo-kabir";

/** The demo visitor: signed in as the house admin. */
export const DEMO_USER: AppUser = {
  uid: YOU,
  displayName: "Rohan Mehta",
  email: "rohan@example.com",
};

const NAMES: Record<string, string> = {
  [YOU]: "Rohan Mehta",
  [MEERA]: "Meera Nair",
  [ARJUN]: "Arjun Pillai",
  [KABIR]: "Kabir Shah",
};

/** Who ate what, from five days ago (first) to tomorrow (last). "b" breakfast, "l" lunch. */
const MEAL_PLAN: Record<string, string[]> = {
  [YOU]: ["bl", "b", "bl", "l", "bl", "b", ""],
  [MEERA]: ["b", "bl", "b", "bl", "b", "bl", "b"],
  [ARJUN]: ["l", "l", "bl", "b", "l", "l", "bl"],
  [KABIR]: ["bl", "", "l", "bl", "bl", "", "l"],
};
const FIRST_DAY = -5;

/** The last house bill (you paid it) covered every meal up to and including this day. */
const LAST_BILL_DAY = -3;

/** An earlier bill, before the five days shown, paid by Kabir. */
const OLDER_BILL: Array<[string, number]> = [
  [YOU, 330],
  [MEERA, 280],
  [ARJUN, 300],
  [KABIR, 260],
];

const share = (userId: string, amount: number): SettlementShare => ({
  userId,
  name: NAMES[userId],
  amount,
});

export function createDemoState(): DemoState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const at = (dayOffset: number, hours: number, minutes: number) => {
    const date = addDays(today, dayOffset);
    date.setHours(hours, minutes);
    return date;
  };

  // Orders, plus what each person owed for the last bill and owes now.
  const orders: Record<string, DailyOrder> = {};
  const lastBill: Record<string, number> = {};
  const dues: Record<string, number> = {};

  for (const [uid, plan] of Object.entries(MEAL_PLAN)) {
    plan.forEach((meals, index) => {
      const dayOffset = FIRST_DAY + index;
      const selection = { breakfast: meals.includes("b"), lunch: meals.includes("l") };
      const amount = calculateOrderAmount(selection);
      if (amount === 0) return;

      const dateId = formatDateId(addDays(today, dayOffset));
      orders[`${dateId}_${uid}`] = {
        userId: uid,
        userName: NAMES[uid],
        deliveryDate: dateId,
        ...selection,
        amount,
        status: "ordered",
      };

      const bucket = dayOffset <= LAST_BILL_DAY ? lastBill : dues;
      bucket[uid] = (bucket[uid] ?? 0) + amount;
    });
  }

  // Three payments: Kabir paid a bill, Arjun paid Kabir back, then you paid the last bill.
  const olderShares = OLDER_BILL.map(([uid, amount]) => share(uid, amount));
  const lastShares = Object.keys(NAMES)
    .filter((uid) => lastBill[uid])
    .map((uid) => share(uid, lastBill[uid]));

  const bill = (id: string, payer: string, shares: SettlementShare[], when: Date): Settlement => ({
    id,
    kind: "bill",
    amount: shares.reduce((total, item) => total + item.amount, 0),
    paidBy: payer,
    paidByName: NAMES[payer],
    shares,
    createdBy: payer,
    createdByName: NAMES[payer],
    dateId: formatDateId(when),
    createdAt: when,
  });

  const settlements: Settlement[] = [
    bill("demo-bill-1", KABIR, olderShares, at(-6, 19, 30)),
    {
      id: "demo-repay-1",
      kind: "repayment",
      amount: 300,
      fromId: ARJUN,
      fromName: NAMES[ARJUN],
      toId: KABIR,
      toName: NAMES[KABIR],
      createdBy: ARJUN,
      createdByName: NAMES[ARJUN],
      dateId: formatDateId(at(-5, 20, 15)),
      createdAt: at(-5, 20, 15),
    },
    bill("demo-bill-2", YOU, lastShares, at(LAST_BILL_DAY, 21, 5)),
  ];

  // Replay those payments into who-owes-who.
  const debts: DemoState["debts"] = {};

  for (const settlement of settlements) {
    if (settlement.kind === "bill") {
      for (const item of settlement.shares) {
        if (item.userId !== settlement.paidBy) {
          addDebt(debts, item.userId, settlement.paidBy, item.amount);
        }
      }
    } else {
      // Paying back is the reverse of owing.
      addDebt(debts, settlement.toId, settlement.fromId, settlement.amount);
    }
  }

  const people: DemoState["people"] = {};
  for (const [uid, name] of Object.entries(NAMES)) {
    people[uid] = { name, outstandingBalance: dues[uid] ?? 0 };
  }
  people[YOU] = { ...people[YOU], role: "admin", email: DEMO_USER.email };

  return {
    people,
    orders,
    debts,
    settlements,
    accessRequests: {
      "demo-nikhil": {
        uid: "demo-nikhil",
        name: "Nikhil Varma",
        email: "nikhil.varma@example.com",
        photoURL: null,
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    },
    vendorBoard: null,
  };
}
