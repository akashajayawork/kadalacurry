// Asking the main admin for a room (/create), and answering (/admin).
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import type { GoogleAccount, RoomRequest } from "@/types";

import { asText } from "./refs";

const requestsCollection = collection(db, COLLECTIONS.roomRequests);

function toRoomRequest(uid: string, data: DocumentData): RoomRequest {
  return {
    uid,
    name: asText(data.name),
    email: asText(data.email),
    photoURL: asText(data.photoURL),
    requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate() : null,
    status: data.status === "approved" ? "approved" : "pending",
  };
}

/** The signed-in person's own request, or null if they haven't asked. */
export function subscribeToMyRoomRequest(
  uid: string,
  onChange: (request: RoomRequest | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(requestsCollection, uid),
    (snapshot) =>
      onChange(
        snapshot.exists()
          ? toRoomRequest(snapshot.id, snapshot.data({ serverTimestamps: "estimate" }))
          : null
      ),
    onError
  );
}

/** Asks the main admin for permission to create a room. */
export async function requestRoom(account: GoogleAccount): Promise<void> {
  await setDoc(doc(requestsCollection, account.uid), {
    name: account.displayName,
    email: account.email,
    photoURL: account.photoURL,
    requestedAt: serverTimestamp(),
    status: "pending",
  });
}

/** Every request, oldest first. Main admin only. */
export function subscribeToRoomRequests(
  onChange: (requests: RoomRequest[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(requestsCollection, orderBy("requestedAt", "asc")),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) =>
          toRoomRequest(document.id, document.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

/** Lets them create one room. The request is used up when they do. */
export async function approveRoomRequest(uid: string): Promise<void> {
  await updateDoc(doc(requestsCollection, uid), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
}

export async function declineRoomRequest(uid: string): Promise<void> {
  await deleteDoc(doc(requestsCollection, uid));
}
