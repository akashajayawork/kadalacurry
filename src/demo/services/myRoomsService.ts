// Demo stand-in for src/services/myRoomsService.ts: the demo visitor only has the demo room.
import type { RoomSummary } from "@/types";

export async function saveMyRoom(): Promise<void> {}

export async function fetchMyRooms(): Promise<RoomSummary[]> {
  return [];
}
