import { useEffect, useState } from "react";

import { subscribeToDebts } from "@/services/debtService";
import type { Debt } from "@/types";

/** Real-time list of what the user and each roommate owe each other. */
export function useDebts(uid: string) {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(
    () =>
      subscribeToDebts(uid, setDebts, (error) => {
        console.error("Debts listener error:", error);
      }),
    [uid]
  );

  return debts;
}
