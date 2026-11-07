import { useEffect, useState } from "react";

import { useRoom } from "@/features/rooms";
import { subscribeToJoinRequests } from "@/services/joinRequestService";
import type { JoinRequest } from "@/types";

/** Real-time list of people waiting to join the room. Only listens for the room admin. */
export function useJoinRequests() {
  const { roomId, isRoomAdmin } = useRoom();
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    if (!isRoomAdmin) return;

    return subscribeToJoinRequests(roomId, setRequests, (error) => {
      console.error("Join requests listener error:", error);
    });
  }, [roomId, isRoomAdmin]);

  return isRoomAdmin ? requests : [];
}
