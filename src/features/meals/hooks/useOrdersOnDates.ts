import { useEffect, useState } from "react";

import { subscribeToOrdersOnDates } from "@/services/orderService";
import type { DailyOrder } from "@/types";

/** Real-time list of every roommate's orders on the given dates. */
export function useOrdersOnDates(dateIds: string[]) {
  const [orders, setOrders] = useState<DailyOrder[]>([]);
  const datesKey = dateIds.join(",");

  useEffect(
    () =>
      subscribeToOrdersOnDates(datesKey.split(","), setOrders, (error) => {
        console.error("Error loading shared orders:", error);
      }),
    [datesKey]
  );

  return orders;
}
