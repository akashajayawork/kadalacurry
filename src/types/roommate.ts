/** A member of the room. */
export type Roommate = {
  id: string;
  name: string;
  /** Their unpaid meal bill. Never below zero. */
  outstandingBalance: number;
};

/** The minimum needed to show and record someone in a settlement. */
export type Person = Pick<Roommate, "id" | "name">;
