import { useEffect, useState } from "react";

import { isRoomIdAvailable } from "@/services/roomAdminService";

export type Availability = "idle" | "checking" | "available" | "taken" | "error";

/** Whether a room id is still free, checked a moment after typing stops. */
export function useRoomIdAvailability(roomId: string, enabled: boolean): Availability {
  const [result, setResult] = useState<{ roomId: string; available: boolean | null } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      isRoomIdAvailable(roomId)
        .then((available) => {
          if (!cancelled) setResult({ roomId, available });
        })
        .catch((error) => {
          console.error("Room name check failed:", error);
          if (!cancelled) setResult({ roomId, available: null });
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [roomId, enabled]);

  if (!enabled) return "idle";
  if (result?.roomId !== roomId) return "checking";
  if (result.available === null) return "error";
  return result.available ? "available" : "taken";
}
