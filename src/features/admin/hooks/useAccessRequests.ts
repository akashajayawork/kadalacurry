import { useEffect, useState } from "react";

import { subscribeToAccessRequests } from "@/services/accessService";
import type { AccessRequest } from "@/types";

/** Real-time list of people waiting for access. Only listens when `enabled` (admins). */
export function useAccessRequests(enabled: boolean) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);

  useEffect(() => {
    if (!enabled) return;

    return subscribeToAccessRequests(setRequests, (error) => {
      console.error("Access requests listener error:", error);
    });
  }, [enabled]);

  return requests;
}
