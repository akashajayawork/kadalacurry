import { useEffect, useState } from "react";

import { useRoom } from "@/features/rooms";
import { subscribeToOrdersInRange } from "@/services/orderService";
import type { DailyOrder } from "@/types";
import { getMonthRange } from "@/utils/date";

/** Real-time list of every roommate's orders in the given month (0-based). */
export function useMonthlyOrders(year: number, month: number) {
  const { roomId } = useRoom();
  const [orders, setOrders] = useState<DailyOrder[]>([]);

  useEffect(() => {
    const { start, end } = getMonthRange(year, month);

    return subscribeToOrdersInRange(roomId, start, end, setOrders, (error) => {
      console.error("Monthly orders error:", error);
    });
  }, [roomId, year, month]);

  return orders;
}
