import { useEffect, useState } from "react";

import { subscribeToRoommates } from "@/services/memberService";
import type { Roommate } from "@/types";

import { useRoom } from "./useRoom";

/** Everyone in the current room, in real time. */
export function useRoommates() {
  const { roomId } = useRoom();
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () =>
      subscribeToRoommates(
        roomId,
        (fetchedRoommates) => {
          setRoommates(fetchedRoommates);
          setError("");
          setLoading(false);
        },
        (snapshotError) => {
          console.error("Error loading roommates:", snapshotError);
          setError("Couldn't load your roommates. Check your connection and try again.");
          setLoading(false);
        }
      ),
    [roomId]
  );

  return { roommates, loading, error };
}
