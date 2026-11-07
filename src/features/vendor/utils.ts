import { MEALS } from "@/constants/meals";
import type { DailyOrder, Meal, MealCounts, Roommate, VendorBoard, VendorBoardUpdate } from "@/types";

export function countMeals(orders: DailyOrder[], dateId: string): MealCounts {
  const dayOrders = orders.filter((order) => order.deliveryDate === dateId);
  const count = (meal: Meal) => dayOrders.filter((order) => order[meal]).length;

  return { breakfast: count("breakfast"), lunch: count("lunch"), dinner: count("dinner") };
}

export function sumDues(roommates: Roommate[]): number {
  return roommates.reduce((total, roommate) => total + roommate.outstandingBalance, 0);
}

/**
 * What to write to bring the board up to date, or null if it already is.
 * Days before `todayId` are dropped from the board.
 */
export function getBoardUpdate(
  board: VendorBoard | null,
  wanted: Omit<VendorBoardUpdate, "removeDays">,
  todayId: string
): VendorBoardUpdate | null {
  const removeDays = Object.keys(board?.days ?? {}).filter((dateId) => dateId < todayId);

  const isCurrent =
    board !== null &&
    board.roomName === wanted.roomName &&
    board.meals.join() === wanted.meals.join() &&
    board.totalDue === wanted.totalDue &&
    removeDays.length === 0 &&
    Object.entries(wanted.days).every(([dateId, counts]) => {
      const current = board.days[dateId];
      return MEALS.every((meal) => current?.[meal] === counts[meal]);
    });

  return isCurrent ? null : { ...wanted, removeDays };
}
