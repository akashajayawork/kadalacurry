export type Meal = "breakfast" | "lunch" | "dinner";

export type MealSelection = Record<Meal, boolean>;

/**
 * What each ordered meal cost when it was added. Kept on the order so a later
 * price change doesn't rewrite meals that were already ordered.
 */
export type MealPrices = Partial<Record<Meal, number>>;

/** A selection together with what it costs. */
export type PricedSelection = MealSelection & {
  prices: MealPrices;
  amount: number;
};

export type DailyOrder = PricedSelection & {
  userId: string;
  userName: string;
  /** Date id in YYYY-MM-DD format. */
  deliveryDate: string;
  status?: string;
};
