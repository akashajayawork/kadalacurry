import { useEffect, useState } from "react";

import { useRoom } from "@/features/rooms";
import { subscribeToOrdersOnDates } from "@/services/orderService";
import type { DailyOrder } from "@/types";

/** Real-time list of every roommate's orders on the given dates. */
export function useOrdersOnDates(dateIds: string[]) {
  const { roomId } = useRoom();
  const [orders, setOrders] = useState<DailyOrder[]>([]);
  const datesKey = dateIds.join(",");

  useEffect(
    () =>
      subscribeToOrdersOnDates(roomId, datesKey.split(","), setOrders, (error) => {
        console.error("Error loading shared orders:", error);
      }),
    [roomId, datesKey]
  );

  return orders;
}
