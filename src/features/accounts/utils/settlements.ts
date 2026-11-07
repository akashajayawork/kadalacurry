import type { PaymentMethod, Settlement } from "@/types";

export const PAID_VIA_LABELS: Record<PaymentMethod, string> = {
  gpay: "Google Pay",
  upi: "UPI",
  other: "Paid another way",
};

/** One-line description from the current user's point of view, e.g. "Rahul paid you". */
export function describeSettlement(settlement: Settlement, currentUserId: string): string {
  if (settlement.kind === "bill") {
    const payer = settlement.paidBy === currentUserId ? "You" : settlement.paidByName;
    return `${payer} paid the meal bill`;
  }

  const from = settlement.fromId === currentUserId ? "You" : settlement.fromName;
  const to = settlement.toId === currentUserId ? "you" : settlement.toName;
  return `${from} paid ${to}`;
}
