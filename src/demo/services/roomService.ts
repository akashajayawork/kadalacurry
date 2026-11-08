// Demo stand-in for src/services/roomService.ts (same functions, in memory).
import type { Room, RoomSettings } from "@/types";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

export function toRoom(id: string, data: Omit<Room, "id">): Room {
  return { ...data, id };
}

export function subscribeToRoom(roomId: string, onChange: (room: Room | null) => void) {
  return watchDemoState((state) => onChange(state.room.id === roomId ? { ...state.room } : null));
}

export async function updateRoomSettings(_roomId: string, settings: RoomSettings): Promise<void> {
  await simulateLatency(400);

  updateDemoState((state) => {
    state.room = { ...state.room, meals: settings.meals, vendorUpi: settings.vendorUpi.trim() };
  });
}
