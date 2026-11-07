import { onSnapshot, runTransaction, type DocumentData } from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { ROOM_COLLECTIONS } from "@/constants/firestore";
import type { Roommate } from "@/types";

import { roomCollection, roomDoc } from "./refs";

/** Thrown when removing someone whose meals aren't paid for yet. */
export class MemberHasDueError extends Error {
  constructor() {
    super("Their due has to be settled before they can be removed.");
    this.name = "MemberHasDueError";
  }
}

export function toRoommate(id: string, data: DocumentData): Roommate {
  return {
    id,
    name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_ROOMMATE_NAME,
    outstandingBalance: typeof data.outstandingBalance === "number" ? data.outstandingBalance : 0,
  };
}

const memberRef = (roomId: string, uid: string) => roomDoc(roomId, ROOM_COLLECTIONS.members, uid);

/** Everyone in the room. */
export function subscribeToRoommates(
  roomId: string,
  onChange: (roommates: Roommate[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    roomCollection(roomId, ROOM_COLLECTIONS.members),
    (snapshot) => {
      onChange(snapshot.docs.map((document) => toRoommate(document.id, document.data())));
    },
    onError
  );
}

/**
 * The signed-in person's own membership: their member record, or null while
 * they aren't in the room (not approved yet, or removed).
 */
export function subscribeToMembership(
  roomId: string,
  uid: string,
  onChange: (member: Roommate | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    memberRef(roomId, uid),
    (snapshot) => onChange(snapshot.exists() ? toRoommate(snapshot.id, snapshot.data()) : null),
    onError
  );
}

export function subscribeToMemberBalance(
  roomId: string,
  uid: string,
  onChange: (balance: number) => void,
  onError?: (error: Error) => void
) {
  return subscribeToMembership(
    roomId,
    uid,
    (member) => onChange(member?.outstandingBalance ?? 0),
    onError
  );
}

/**
 * Room admin only: takes someone out of the room. They lose access straight
 * away. Their orders and payment history stay, and they can ask to join again.
 */
export async function removeMember(roomId: string, uid: string): Promise<void> {
  const ref = memberRef(roomId, uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return;

    // Their unpaid meals would vanish from the house bill.
    if (toRoommate(uid, snapshot.data()).outstandingBalance !== 0) throw new MemberHasDueError();

    transaction.delete(ref);
  });
}
