import { useEffect, useState } from "react";

import { useRoom } from "@/features/rooms";
import { subscribeToDebts } from "@/services/debtService";
import type { Debt } from "@/types";

/** Real-time list of what the user and each roommate owe each other. */
export function useDebts(uid: string) {
  const { roomId } = useRoom();
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(
    () =>
      subscribeToDebts(roomId, uid, setDebts, (error) => {
        console.error("Debts listener error:", error);
      }),
    [roomId, uid]
  );

  return debts;
}
