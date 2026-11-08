import { useEffect, useState } from "react";

import { subscribeToVendorBoard } from "@/services/vendorService";
import type { VendorBoard } from "@/types";

/** Real-time vendor board for the public page. */
export function useVendorBoard(roomId: string) {
  const [board, setBoard] = useState<VendorBoard | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(
    () =>
      subscribeToVendorBoard(
        roomId,
        (value) => {
          setBoard(value);
          setStatus("ready");
        },
        (error) => {
          console.error("Couldn't load the vendor board:", error);
          setStatus("error");
        }
      ),
    [roomId]
  );

  return { board, status };
}
