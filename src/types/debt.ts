/** What the current user and one roommate owe each other. */
export type Debt = {
  id: string;
  otherUserId: string;
  /** Positive: they owe you. Negative: you owe them. */
  amount: number;
};
