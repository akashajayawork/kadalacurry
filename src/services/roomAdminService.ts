// Creating, listing and deleting rooms: used by /create and /admin, never inside a room.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS, ROOM_COLLECTIONS } from "@/constants/firestore";
import type { GoogleAccount, Room, RoomSettings } from "@/types";

import { myRoomRef, roomCollection, roomDoc, roomRef } from "./refs";
import { toRoom } from "./roomService";

/** Firestore takes at most 500 writes in one batch. */
const BATCH_SIZE = 400;

export class RoomNameTakenError extends Error {
  constructor() {
    super("A room with this name already exists.");
    this.name = "RoomNameTakenError";
  }
}

export class RoomNotApprovedError extends Error {
  constructor() {
    super("Your room request hasn't been approved.");
    this.name = "RoomNotApprovedError";
  }
}

/** Whether no room uses this id yet. */
export async function isRoomIdAvailable(roomId: string): Promise<boolean> {
  return !(await getDoc(roomRef(roomId))).exists();
}

export type NewRoom = RoomSettings & {
  roomId: string;
  name: string;
  /** The creator's name inside the room. */
  adminName: string;
};

/**
 * Creates the room with its creator as its one admin and first member. Uses
 * up their approved room request (the main admin doesn't need one). The name
 * is checked again here, inside the transaction, so two people can never end
 * up with the same room.
 */
export async function createRoom(account: GoogleAccount, room: NewRoom): Promise<void> {
  const requestRef = doc(db, COLLECTIONS.roomRequests, account.uid);

  await runTransaction(db, async (transaction) => {
    const [existing, request] = await Promise.all([
      transaction.get(roomRef(room.roomId)),
      transaction.get(requestRef),
    ]);

    if (existing.exists()) throw new RoomNameTakenError();

    if (request.exists()) {
      if (request.data().status !== "approved") throw new RoomNotApprovedError();
      transaction.delete(requestRef);
    }
    // Without a request only the main admin gets through (checked by the rules).

    transaction.set(roomRef(room.roomId), {
      name: room.name,
      adminUid: account.uid,
      adminName: room.adminName,
      meals: room.meals,
      vendorUpi: room.vendorUpi.trim(),
      createdAt: serverTimestamp(),
    });
    transaction.set(roomDoc(room.roomId, ROOM_COLLECTIONS.members, account.uid), {
      name: room.adminName,
      email: account.email,
      outstandingBalance: 0,
      joinedAt: serverTimestamp(),
    });
    transaction.set(myRoomRef(account.uid, room.roomId), {
      name: room.name,
      updatedAt: serverTimestamp(),
    });
  });
}

/** Every room, newest first. Main admin only. */
export function subscribeToRooms(
  onChange: (rooms: Room[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.rooms), orderBy("createdAt", "desc")),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) =>
          toRoom(document.id, document.data({ serverTimestamps: "estimate" }))
        )
      );
    },
    onError
  );
}

export async function deleteInBatches(refs: DocumentReference[]): Promise<void> {
  for (let start = 0; start < refs.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    refs.slice(start, start + BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

/**
 * Main admin only: deletes the room and everything in it (members, orders,
 * debts, payment history, requests and the vendor board). Can't be undone.
 */
export async function deleteRoom(roomId: string): Promise<void> {
  // Take it off its members' lists of rooms first, while they can still be found.
  const members = await getDocs(roomCollection(roomId, ROOM_COLLECTIONS.members));
  await deleteInBatches(members.docs.map((member) => myRoomRef(member.id, roomId)));

  for (const name of Object.values(ROOM_COLLECTIONS)) {
    const snapshot = await getDocs(roomCollection(roomId, name));
    await deleteInBatches(snapshot.docs.map((document) => document.ref));
  }

  await deleteInBatches([doc(db, COLLECTIONS.vendorBoards, roomId), roomRef(roomId)]);
}
