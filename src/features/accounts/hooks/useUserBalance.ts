import { useEffect, useState } from "react";

import { useRoom } from "@/features/rooms";
import { subscribeToMemberBalance } from "@/services/memberService";

/** Real-time outstanding balance for the given member, or null until it loads. */
export function useUserBalance(uid: string) {
  const { roomId } = useRoom();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(
    () =>
      subscribeToMemberBalance(roomId, uid, setBalance, (error) => {
        console.error("Balance listener error:", error);
      }),
    [roomId, uid]
  );

  return balance;
}
