import { useEffect, useState } from "react";

import { subscribeToUserBalance } from "@/services/userService";

/** Real-time outstanding balance for the given user, or null until it loads. */
export function useUserBalance(uid: string) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(
    () =>
      subscribeToUserBalance(uid, setBalance, (error) => {
        console.error("Balance listener error:", error);
      }),
    [uid]
  );

  return balance;
}
