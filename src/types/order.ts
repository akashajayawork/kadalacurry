export type Meal = "breakfast" | "lunch";

export type MealSelection = Record<Meal, boolean>;

export type DailyOrder = MealSelection & {
  userId: string;
  userName: string;
  /** Date id in YYYY-MM-DD format. */
  deliveryDate: string;
  amount: number;
  status?: string;
};
