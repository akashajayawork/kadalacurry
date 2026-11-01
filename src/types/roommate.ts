export type Roommate = {
  id: string;
  name: string;
  outstandingBalance: number;
};

/** The minimum needed to show and record someone in a settlement. */
export type Person = Pick<Roommate, "id" | "name">;
