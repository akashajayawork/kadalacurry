import type { DailyOrder, GoogleAccount, MealSettings, Settlement, SettlementShare } from "@/types";
import { addDays, formatDateId } from "@/utils/date";
import { priceSelection } from "@/utils/meals";

import { addDebt } from "./ledger";
import type { DemoState } from "./store";

/*
 * The sample room. Everything is relative to today, so the "last five days"
 * are always the real last five days.
 */

/** "demo" is reserved, so no real room can have this id. */
export const DEMO_ROOM_ID = "demo";

const YOU = "demo-you";
const MEERA = "demo-meera";
const ARJUN = "demo-arjun";
const KABIR = "demo-kabir";
const RIYA = "demo-riya";

/** Used until the visitor tells us their name. */
export const PLACEHOLDER_NAME = "there";

/** The demo visitor, signed in as the room admin under the name they gave. */
export function createDemoAccount(name: string): GoogleAccount {
  return { uid: YOU, displayName: name, email: "you@example.com", emailVerified: true, photoURL: null };
}

/** Everyone but the visitor, whose name is filled in per visit. */
const ROOMMATE_NAMES: Record<string, string> = {
  [MEERA]: "Meera Nair",
  [ARJUN]: "Arjun Pillai",
  [KABIR]: "Kabir Shah",
  // Moved in recently and has paid up, so the visitor can try removing someone.
  [RIYA]: "Riya Thomas",
};

const DEMO_MEALS: MealSettings = {
  breakfast: { enabled: true, price: 50 },
  lunch: { enabled: true, price: 60 },
  dinner: { enabled: true, price: 70 },
};

/** Who ate what, from five days ago (first) to tomorrow (last). b: breakfast, l: lunch, d: dinner. */
const MEAL_PLAN: Record<string, string[]> = {
  [YOU]: ["bl", "bd", "bl", "ld", "bl", "b", ""],
  [MEERA]: ["b", "bl", "bd", "bl", "b", "bld", "b"],
  [ARJUN]: ["ld", "l", "bl", "b", "ld", "l", "bl"],
  [KABIR]: ["bl", "", "l", "bld", "bl", "d", "l"],
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

/** The sample room, with the visitor (its admin) called `visitorName`. */
export function createDemoState(visitorName: string): DemoState {
  const NAMES: Record<string, string> = { [YOU]: visitorName, ...ROOMMATE_NAMES };
  const share = (userId: string, amount: number): SettlementShare => ({
    userId,
    name: NAMES[userId],
    amount,
  });

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
      const order = priceSelection(
        { breakfast: meals.includes("b"), lunch: meals.includes("l"), dinner: meals.includes("d") },
        DEMO_MEALS
      );
      if (order.amount === 0) return;

      const dateId = formatDateId(addDays(today, dayOffset));
      orders[`${dateId}_${uid}`] = {
        ...order,
        userId: uid,
        userName: NAMES[uid],
        deliveryDate: dateId,
        status: "ordered",
      };

      const bucket = dayOffset <= LAST_BILL_DAY ? lastBill : dues;
      bucket[uid] = (bucket[uid] ?? 0) + order.amount;
    });
  }

  // Three payments: Kabir paid a bill, Arjun paid Kabir back, then you paid the last bill.
  const olderShares = OLDER_BILL.map(([uid, amount]) => share(uid, amount));
  const lastShares = Object.keys(NAMES)
    .filter((uid) => lastBill[uid])
    .map((uid) => share(uid, lastBill[uid]));

  const bill = (
    id: string,
    payer: string,
    shares: SettlementShare[],
    when: Date,
    paidVia: "gpay" | "other"
  ): Settlement => ({
    id,
    kind: "bill",
    amount: shares.reduce((total, item) => total + item.amount, 0),
    paidBy: payer,
    paidByName: NAMES[payer],
    paidVia,
    shares,
    createdBy: payer,
    createdByName: NAMES[payer],
    dateId: formatDateId(when),
    createdAt: when,
  });

  const settlements: Settlement[] = [
    bill("demo-bill-1", KABIR, olderShares, at(-6, 19, 30), "other"),
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
    bill("demo-bill-2", YOU, lastShares, at(LAST_BILL_DAY, 21, 5), "gpay"),
  ];

  // Replay those payments into who-owes-who.
  const debts: DemoState["debts"] = {};

  for (const settlement of settlements) {
    if (settlement.kind === "bill") {
      for (const item of settlement.shares) {
        if (item.userId !== settlement.paidBy) {
          addDebt(debts, item.userId, settlement.paidBy, item.amount, NAMES);
        }
      }
    } else {
      // Paying back is the reverse of owing.
      addDebt(debts, settlement.toId, settlement.fromId, settlement.amount, NAMES);
    }
  }

  const members: DemoState["members"] = {};
  for (const [uid, name] of Object.entries(NAMES)) {
    members[uid] = { name, outstandingBalance: dues[uid] ?? 0 };
  }
  members[YOU].email = createDemoAccount(visitorName).email;

  return {
    room: {
      id: DEMO_ROOM_ID,
      name: "Demo House",
      adminUid: YOU,
      adminName: visitorName,
      meals: DEMO_MEALS,
      // Not a real UPI ID: the demo never opens a payment app.
      vendorUpi: "demo.vendor@okaxis",
      createdAt: at(-30, 10, 0),
    },
    members,
    orders,
    debts,
    settlements,
    joinRequests: {
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
