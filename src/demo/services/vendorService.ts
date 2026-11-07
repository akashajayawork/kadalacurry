// Demo stand-in for src/services/vendorService.ts (same functions, in memory).
import type { MealCounts, VendorBoard } from "@/types";

import { updateDemoState, watchDemoState } from "../store";

export function subscribeToVendorBoard(onChange: (board: VendorBoard | null) => void) {
  return watchDemoState((state) => onChange(state.vendorBoard));
}

export async function saveVendorBoard(
  totalDue: number,
  days: Record<string, MealCounts>,
  removeDays: string[] = []
): Promise<void> {
  updateDemoState((state) => {
    const nextDays = { ...state.vendorBoard?.days, ...days };
    for (const dateId of removeDays) delete nextDays[dateId];
    state.vendorBoard = { totalDue, days: nextDays, updatedAt: new Date() };
  });
}
