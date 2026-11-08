/** What the current user and one roommate owe each other. */
export type Debt = {
  id: string;
  otherUserId: string;
  /** Their name as saved on the debt, for roommates who have since left the room. */
  otherName: string | null;
  /** Positive: they owe you. Negative: you owe them. */
  amount: number;
};
