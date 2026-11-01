import { doc, getDoc, onSnapshot, runTransaction } from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { COLLECTIONS } from "@/constants/firestore";
import type { GoogleAccount } from "@/types";

import { requestAccess } from "./accessService";

export type ApprovalResult =
  | { approved: false }
  | { approved: true; isAdmin: boolean; name: string | null };

/**
 * An existing users/{uid} document means the admin has approved this account.
 * Unapproved accounts leave an access request for the admin. Approved ones get
 * their shared roommate profile created, or its balance re-synced from the
 * users document (the source of truth for the balance).
 */
export async function checkApprovalAndSyncProfile(account: GoogleAccount): Promise<ApprovalResult> {
  const userSnapshot = await getDoc(doc(db, COLLECTIONS.users, account.uid));

  if (!userSnapshot.exists()) {
    // Best effort: the pending screen shows either way.
    await requestAccess(account).catch((error) => {
      console.error("Couldn't send the access request:", error);
    });
    return { approved: false };
  }

  await syncRoommateProfile(account.uid, account.displayName || DEFAULT_ROOMMATE_NAME);

  const data = userSnapshot.data();
  return {
    approved: true,
    isAdmin: data.role === "admin",
    name: typeof data.name === "string" && data.name.trim() ? data.name : null,
  };
}

async function syncRoommateProfile(uid: string, fallbackName: string) {
  const userRef = doc(db, COLLECTIONS.users, uid);
  const roommateRef = doc(db, COLLECTIONS.roommates, uid);

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const roommateSnapshot = await transaction.get(roommateRef);

    if (!userSnapshot.exists()) {
      throw new Error("Approved user profile no longer exists.");
    }

    const userData = userSnapshot.data();
    const outstandingBalance = Number(userData.outstandingBalance ?? 0);

    if (roommateSnapshot.exists()) {
      transaction.update(roommateRef, { outstandingBalance });
    } else {
      transaction.set(roommateRef, {
        name: typeof userData.name === "string" ? userData.name : fallbackName,
        outstandingBalance,
      });
    }
  });
}

/** Calls `onApproved` once the admin approves this account. */
export function subscribeToApproval(
  uid: string,
  onApproved: () => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, COLLECTIONS.users, uid),
    (snapshot) => {
      if (snapshot.exists()) onApproved();
    },
    onError
  );
}

export function subscribeToUserBalance(
  uid: string,
  onChange: (balance: number) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, COLLECTIONS.users, uid),
    (snapshot) => {
      onChange(
        snapshot.exists() ? Number(snapshot.data().outstandingBalance ?? 0) : 0
      );
    },
    onError
  );
}
