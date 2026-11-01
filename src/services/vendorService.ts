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
import { COLLECTIONS, VENDOR_BOARD_ID } from "@/constants/firestore";
import type { MealCounts, VendorBoard } from "@/types";

const boardRef = doc(db, COLLECTIONS.vendorBoard, VENDOR_BOARD_ID);

const asCount = (value: unknown) => (typeof value === "number" ? value : 0);

function toVendorBoard(data: DocumentData): VendorBoard {
  const days: Record<string, MealCounts> = {};

  for (const [dateId, counts] of Object.entries(data.days ?? {})) {
    const value = counts as Partial<MealCounts>;
    days[dateId] = { breakfast: asCount(value.breakfast), lunch: asCount(value.lunch) };
  }

  return {
    totalDue: asCount(data.totalDue),
    days,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  };
}

/** Real-time board, or null if nobody has created it yet. Readable without signing in. */
export function subscribeToVendorBoard(
  onChange: (board: VendorBoard | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    boardRef,
    (snapshot) => onChange(snapshot.exists() ? toVendorBoard(snapshot.data()) : null),
    onError
  );
}

/**
 * Updates the total due and the counts for the given days. Other days on the
 * board are left alone, except `removeDays`, which are deleted.
 */
export async function saveVendorBoard(
  totalDue: number,
  days: Record<string, MealCounts>,
  removeDays: string[] = []
): Promise<void> {
  const dayUpdates: Record<string, MealCounts | FieldValue> = { ...days };

  for (const dateId of removeDays) {
    dayUpdates[dateId] = deleteField();
  }

  await setDoc(
    boardRef,
    { totalDue, days: dayUpdates, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
