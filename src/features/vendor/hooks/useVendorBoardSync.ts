import { useEffect } from "react";

import { MEALS } from "@/constants/meals";
import { subscribeToRoommates } from "@/services/memberService";
import { subscribeToOrdersOnDates } from "@/services/orderService";
import { saveVendorBoard, subscribeToVendorBoard } from "@/services/vendorService";
import type { DailyOrder, Meal, Roommate, VendorBoard } from "@/types";
import { addDays, formatDateId, parseDateId } from "@/utils/date";

import { countMeals, getBoardUpdate, sumDues } from "../utils";

/** After an error (e.g. rules not published yet), start over this much later. */
const RETRY_MS = 30_000;

/**
 * Keeps the room's public vendor board in step with the real data (today's
 * and tomorrow's meal counts, and the house's total due). It runs in every
 * roommate's app, so the board stays current without a server.
 *
 * @param mealsKey the room's meals, comma-separated (a string so the effect only restarts when they change)
 */
export function useVendorBoardSync(roomId: string, roomName: string, mealsKey: string, todayId: string) {
  useEffect(() => {
    const tomorrowId = formatDateId(addDays(parseDateId(todayId), 1));
    const meals = MEALS.filter((meal) => mealsKey.split(",").includes(meal)) as Meal[];
    let orders: DailyOrder[] | null = null;
    let roommates: Roommate[] | null = null;
    let board: VendorBoard | null | undefined; // undefined until it has loaded
    let lastWrite = "";
    let unsubscribers: Array<() => void> = [];
    let retryTimer: number | undefined;
    let stopped = false;

    const unsubscribeAll = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribers = [];
    };

    // Firestore stops a listener after an error, so tear down and start over later.
    const retryLater = (error: unknown) => {
      console.error(`Vendor board sync failed, retrying in ${RETRY_MS / 1000}s:`, error);
      if (stopped || retryTimer !== undefined) return;

      unsubscribeAll();
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        start();
      }, RETRY_MS);
    };

    const sync = () => {
      if (!orders || !roommates || board === undefined) return;

      const update = getBoardUpdate(
        board,
        {
          roomName,
          meals,
          totalDue: sumDues(roommates),
          days: {
            [todayId]: countMeals(orders, todayId),
            [tomorrowId]: countMeals(orders, tomorrowId),
          },
        },
        todayId
      );

      // Skip if up to date, or if this exact write is already on its way.
      const writeKey = JSON.stringify(update);
      if (!update || writeKey === lastWrite) return;
      lastWrite = writeKey;

      saveVendorBoard(roomId, update).catch(retryLater);
    };

    function start() {
      orders = null;
      roommates = null;
      board = undefined;
      lastWrite = "";

      unsubscribers = [
        subscribeToOrdersOnDates(
          roomId,
          [todayId, tomorrowId],
          (value) => {
            orders = value;
            sync();
          },
          retryLater
        ),
        subscribeToRoommates(
          roomId,
          (value) => {
            roommates = value;
            sync();
          },
          retryLater
        ),
        subscribeToVendorBoard(
          roomId,
          (value) => {
            board = value;
            sync();
          },
          retryLater
        ),
      ];
    }

    start();

    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      unsubscribeAll();
    };
  }, [roomId, roomName, mealsKey, todayId]);
}
