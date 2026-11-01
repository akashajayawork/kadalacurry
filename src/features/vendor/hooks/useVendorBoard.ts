import { useEffect, useState } from "react";

import { subscribeToVendorBoard } from "@/services/vendorService";
import type { VendorBoard } from "@/types";

/** Real-time vendor board for the public page. */
export function useVendorBoard() {
  const [board, setBoard] = useState<VendorBoard | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(
    () =>
      subscribeToVendorBoard(
        (value) => {
          setBoard(value);
          setStatus("ready");
        },
        (error) => {
          console.error("Couldn't load the vendor board:", error);
          setStatus("error");
        }
      ),
    []
  );

  return { board, status };
}
