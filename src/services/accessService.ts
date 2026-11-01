import {
  collection,
  deleteDoc,
  doc,
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
import { COLLECTIONS } from "@/constants/firestore";
import type { AccessRequest, GoogleAccount } from "@/types";

const requestsCollection = collection(db, COLLECTIONS.accessRequests);

const asText = (value: unknown) => (typeof value === "string" ? value : null);

function toAccessRequest(uid: string, data: DocumentData): AccessRequest {
  return {
    uid,
    name: asText(data.name),
    email: asText(data.email),
    photoURL: asText(data.photoURL),
    requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate() : null,
  };
}

/** Leaves (or refreshes) a request for the admin from someone who isn't approved yet. */
export async function requestAccess(account: GoogleAccount): Promise<void> {
  await setDoc(doc(requestsCollection, account.uid), {
    name: account.displayName,
    email: account.email,
    photoURL: account.photoURL,
    requestedAt: serverTimestamp(),
  });
}

/** Real-time list of people waiting for access, oldest first. Admin only. */
export function subscribeToAccessRequests(
  onChange: (requests: AccessRequest[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(requestsCollection, orderBy("requestedAt", "asc")),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) =>
          toAccessRequest(document.id, document.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

/**
 * Lets someone in: creates their users/{uid} document (which is what approves
 * an account) and their roommates/{uid} profile, both under their UID and with
 * the name the admin chose, then removes their request.
 */
export async function approveAccessRequest(
  uid: string,
  name: string,
  email: string | null
): Promise<void> {
  const userRef = doc(db, COLLECTIONS.users, uid);
  const roommateRef = doc(db, COLLECTIONS.roommates, uid);

  await runTransaction(db, async (transaction) => {
    const [existingUser, existingRoommate] = await Promise.all([
      transaction.get(userRef),
      transaction.get(roommateRef),
    ]);
    const userData = existingUser.exists() ? existingUser.data() : null;

    // Never overwrite an account that's already approved (its balance and role).
    if (!userData) {
      transaction.set(userRef, {
        name,
        email,
        outstandingBalance: 0,
        approvedAt: serverTimestamp(),
      });
    }

    // Their shared profile, so they show up in the house right away.
    if (!existingRoommate.exists()) {
      transaction.set(roommateRef, {
        name: typeof userData?.name === "string" ? userData.name : name,
        outstandingBalance: Number(userData?.outstandingBalance ?? 0),
      });
    }

    transaction.delete(doc(requestsCollection, uid));
  });
}

export async function declineAccessRequest(uid: string): Promise<void> {
  await deleteDoc(doc(requestsCollection, uid));
}
