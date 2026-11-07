import { useRoomIdAvailability } from "@/hooks/useRoomIdAvailability";
import { getRoomNameProblem, toRoomId } from "@/utils/roomName";

/** Whether `name` can be used for a new room right now. */
export function useRoomNameCheck(name: string) {
  const roomId = toRoomId(name);
  const problem = name.trim() ? getRoomNameProblem(name) : null;
  const availability = useRoomIdAvailability(roomId, Boolean(name.trim()) && !problem);

  return { roomId, problem, availability, isAvailable: availability === "available" };
}

export type RoomNameCheck = ReturnType<typeof useRoomNameCheck>;
