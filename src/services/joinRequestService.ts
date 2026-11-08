import {
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { ROOM_COLLECTIONS } from "@/constants/firestore";
import type { GoogleAccount, JoinRequest } from "@/types";

import { asText, roomCollection, roomDoc } from "./refs";

const requestRef = (roomId: string, uid: string) =>
  roomDoc(roomId, ROOM_COLLECTIONS.joinRequests, uid);

function toJoinRequest(uid: string, data: DocumentData): JoinRequest {
  return {
    uid,
    name: asText(data.name),
    email: asText(data.email),
    photoURL: asText(data.photoURL),
    requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate() : null,
  };
}

/**
 * Leaves (or refreshes) a request for the room admin. Signing in to a room is
 * the only way to ask to join it: nobody can be added without one.
 */
export async function requestToJoin(roomId: string, account: GoogleAccount): Promise<void> {
  await setDoc(requestRef(roomId, account.uid), {
    name: account.displayName,
    email: account.email,
    photoURL: account.photoURL,
    requestedAt: serverTimestamp(),
  });
}

/** Real-time list of people waiting to join, oldest first. Room admin only. */
export function subscribeToJoinRequests(
  roomId: string,
  onChange: (requests: JoinRequest[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(roomCollection(roomId, ROOM_COLLECTIONS.joinRequests), orderBy("requestedAt", "asc")),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) =>
          toJoinRequest(document.id, document.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

/**
 * Lets someone in under the name the room admin chose: creates their member
 * record (which is what grants access) and removes their request, together.
 */
export async function approveJoinRequest(
  roomId: string,
  uid: string,
  name: string,
  email: string | null
): Promise<void> {
  const memberRef = roomDoc(roomId, ROOM_COLLECTIONS.members, uid);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(memberRef);

    // Never overwrite someone who's already in (their balance).
    if (!existing.exists()) {
      transaction.set(memberRef, { name, email, outstandingBalance: 0, joinedAt: serverTimestamp() });
    }

    transaction.delete(requestRef(roomId, uid));
  });
}

export async function declineJoinRequest(roomId: string, uid: string): Promise<void> {
  await deleteDoc(requestRef(roomId, uid));
}
