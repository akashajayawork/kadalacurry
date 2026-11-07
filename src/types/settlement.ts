export type SettlementShare = {
  userId: string;
  name: string;
  amount: number;
};

type SettlementBase = {
  id: string;
  amount: number;
  createdBy: string;
  createdByName: string;
  /** Local date id (YYYY-MM-DD) the settlement was made on. */
  dateId: string;
  createdAt: Date | null;
};

/** How the meal bill was paid. */
export type PaymentMethod = "gpay" | "upi" | "other";

/** Someone paid the whole household meal bill. */
export type BillSettlement = SettlementBase & {
  kind: "bill";
  /** Missing on bills paid before payment methods were recorded. */
  paidVia: PaymentMethod | null;
  paidBy: string;
  paidByName: string;
  shares: SettlementShare[];
};

/** One roommate paid back what they owed another. */
export type Repayment = SettlementBase & {
  kind: "repayment";
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
};

export type Settlement = BillSettlement | Repayment;
