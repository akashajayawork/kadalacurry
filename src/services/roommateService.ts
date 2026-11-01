import { collection, onSnapshot, type DocumentData } from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { COLLECTIONS } from "@/constants/firestore";
import type { Roommate } from "@/types";

export function toRoommate(id: string, data: DocumentData): Roommate {
  return {
    id,
    name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_ROOMMATE_NAME,
    outstandingBalance: typeof data.outstandingBalance === "number" ? data.outstandingBalance : 0,
  };
}

export function subscribeToRoommates(
  onChange: (roommates: Roommate[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, COLLECTIONS.roommates),
    (snapshot) => {
      onChange(snapshot.docs.map((document) => toRoommate(document.id, document.data())));
    },
    onError
  );
}
