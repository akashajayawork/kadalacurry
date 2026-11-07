// Demo stand-in for src/services/roommateService.ts (same functions, in memory).
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import type { Roommate } from "@/types";

import { watchDemoState } from "../store";

export function toRoommate(id: string, data: { name?: unknown; outstandingBalance?: unknown }): Roommate {
  return {
    id,
    name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_ROOMMATE_NAME,
    outstandingBalance: typeof data.outstandingBalance === "number" ? data.outstandingBalance : 0,
  };
}

export function subscribeToRoommates(onChange: (roommates: Roommate[]) => void) {
  return watchDemoState((state) =>
    onChange(Object.entries(state.people).map(([id, person]) => toRoommate(id, person)))
  );
}
