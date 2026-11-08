// Demo stand-in for src/services/vendorService.ts (same functions, in memory).
import type { VendorBoard, VendorBoardUpdate } from "@/types";

import { updateDemoState, watchDemoState } from "../store";

export function subscribeToVendorBoard(_roomId: string, onChange: (board: VendorBoard | null) => void) {
  return watchDemoState((state) => onChange(state.vendorBoard));
}

export async function saveVendorBoard(_roomId: string, update: VendorBoardUpdate): Promise<void> {
  updateDemoState((state) => {
    const days = { ...state.vendorBoard?.days, ...update.days };
    for (const dateId of update.removeDays) delete days[dateId];

    state.vendorBoard = {
      roomName: update.roomName,
      meals: update.meals,
      totalDue: update.totalDue,
      days,
      updatedAt: new Date(),
    };
  });
}
