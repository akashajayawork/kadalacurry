// The rooms an account is in (userRooms/{uid}/rooms/{roomId}), so the home
// page can list them after signing in on any device.
import { deleteDoc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

import { ROOM_COLLECTIONS } from "@/constants/firestore";
import type { RoomSummary } from "@/types";

import { asText, myRoomRef, myRoomsCollection, roomDoc } from "./refs";

/** Notes that the signed-in member is in this room. The rules only allow it for rooms they're really in. */
export async function saveMyRoom(uid: string, roomId: string, name: string): Promise<void> {
  await setDoc(myRoomRef(uid, roomId), { name, updatedAt: serverTimestamp() });
}

/**
 * The rooms this account is in, by name. Rooms they've since left, or that
 * were deleted, are dropped from the list as it's read.
 */
export async function fetchMyRooms(uid: string): Promise<RoomSummary[]> {
  const entries = await getDocs(myRoomsCollection(uid));

  const rooms = await Promise.all(
    entries.docs.map(async (entry) => {
      const membership = await getDoc(roomDoc(entry.id, ROOM_COLLECTIONS.members, uid));
      if (membership.exists()) return { id: entry.id, name: asText(entry.data().name) ?? entry.id };

      await deleteDoc(entry.ref).catch((error) => console.error("Couldn't tidy the room list:", error));
      return null;
    })
  );

  return rooms
    .filter((room): room is RoomSummary => room !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
