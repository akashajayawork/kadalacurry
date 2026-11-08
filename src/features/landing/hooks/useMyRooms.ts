import { useEffect, useState } from "react";

import { fetchMyRooms } from "@/services/myRoomsService";
import type { RoomSummary } from "@/types";

type Result = { uid: string; rooms: RoomSummary[]; failed: boolean };

/** The rooms the signed-in account is in, or nothing while signed out (uid null). */
export function useMyRooms(uid: string | null) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;
    fetchMyRooms(uid)
      .then((rooms) => {
        if (!cancelled) setResult({ uid, rooms, failed: false });
      })
      .catch((error) => {
        console.error("Couldn't load your rooms:", error);
        if (!cancelled) setResult({ uid, rooms: [], failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const current = uid !== null && result?.uid === uid ? result : null;

  return {
    rooms: current?.rooms ?? [],
    loading: uid !== null && current === null,
    failed: current?.failed ?? false,
  };
}
