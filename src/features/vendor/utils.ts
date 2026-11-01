import type { DailyOrder, MealCounts, Roommate, VendorBoard } from "@/types";

export function countMeals(orders: DailyOrder[], dateId: string): MealCounts {
  const dayOrders = orders.filter((order) => order.deliveryDate === dateId);

  return {
    breakfast: dayOrders.filter((order) => order.breakfast).length,
    lunch: dayOrders.filter((order) => order.lunch).length,
  };
}

export function sumDues(roommates: Roommate[]): number {
  return roommates.reduce((total, roommate) => total + roommate.outstandingBalance, 0);
}

export type BoardUpdate = {
  totalDue: number;
  days: Record<string, MealCounts>;
  removeDays: string[];
};

/**
 * What to write to bring the board up to date, or null if it already is.
 * Days before `todayId` are dropped from the board.
 */
export function getBoardUpdate(
  board: VendorBoard | null,
  totalDue: number,
  days: Record<string, MealCounts>,
  todayId: string
): BoardUpdate | null {
  const removeDays = Object.keys(board?.days ?? {}).filter((dateId) => dateId < todayId);

  const isCurrent =
    board !== null &&
    board.totalDue === totalDue &&
    removeDays.length === 0 &&
    Object.entries(days).every(([dateId, counts]) => {
      const current = board.days[dateId];
      return current?.breakfast === counts.breakfast && current?.lunch === counts.lunch;
    });

  return isCurrent ? null : { totalDue, days, removeDays };
}
