import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
  type FieldValue,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import { MEALS } from "@/constants/meals";
import type { Meal, MealCounts, VendorBoard, VendorBoardUpdate } from "@/types";

/** vendorBoards/{roomId}: public, so it sits outside the room. */
const boardRef = (roomId: string) => doc(db, COLLECTIONS.vendorBoards, roomId);

const asCount = (value: unknown) => (typeof value === "number" ? value : 0);

function toVendorBoard(data: DocumentData): VendorBoard {
  const days: Record<string, MealCounts> = {};

  for (const [dateId, counts] of Object.entries(data.days ?? {})) {
    const value = (counts ?? {}) as Partial<Record<Meal, unknown>>;
    days[dateId] = {
      breakfast: asCount(value.breakfast),
      lunch: asCount(value.lunch),
      dinner: asCount(value.dinner),
    };
  }

  return {
    roomName: typeof data.roomName === "string" ? data.roomName : "",
    meals: Array.isArray(data.meals) ? MEALS.filter((meal) => data.meals.includes(meal)) : [],
    totalDue: asCount(data.totalDue),
    days,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  };
}

/** Real-time board, or null if nobody has created it yet. Readable without signing in. */
export function subscribeToVendorBoard(
  roomId: string,
  onChange: (board: VendorBoard | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    boardRef(roomId),
    (snapshot) => onChange(snapshot.exists() ? toVendorBoard(snapshot.data()) : null),
    onError
  );
}

export async function saveVendorBoard(roomId: string, update: VendorBoardUpdate): Promise<void> {
  const dayUpdates: Record<string, MealCounts | FieldValue> = { ...update.days };

  for (const dateId of update.removeDays) {
    dayUpdates[dateId] = deleteField();
  }

  await setDoc(
    boardRef(roomId),
    {
      roomName: update.roomName,
      meals: update.meals,
      totalDue: update.totalDue,
      days: dayUpdates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
