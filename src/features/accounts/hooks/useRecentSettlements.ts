import { useEffect, useState } from "react";

import { subscribeToRecentSettlements } from "@/services/settlementService";
import type { Settlement } from "@/types";

/** Real-time list of the latest settlements, newest first. */
export function useRecentSettlements(count = 20) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      subscribeToRecentSettlements(
        count,
        (items) => {
          setSettlements(items);
          setLoading(false);
        },
        (error) => {
          console.error("Payment history listener error:", error);
          setLoading(false);
        }
      ),
    [count]
  );

  return { settlements, loading };
}
