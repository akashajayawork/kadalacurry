import { collection, doc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS, type RoomCollection } from "@/constants/firestore";

/** rooms/{roomId} */
export const roomRef = (roomId: string) => doc(db, COLLECTIONS.rooms, roomId);

/** rooms/{roomId}/{name} */
export const roomCollection = (roomId: string, name: RoomCollection) =>
  collection(db, COLLECTIONS.rooms, roomId, name);

/** rooms/{roomId}/{name}/{id} */
export const roomDoc = (roomId: string, name: RoomCollection, id: string) =>
  doc(db, COLLECTIONS.rooms, roomId, name, id);

export const asText = (value: unknown) => (typeof value === "string" ? value : null);
