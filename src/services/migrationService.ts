/*
 * Moving the original single-house app (v1) into a room. v1 kept everything in
 * top-level collections (users, roommates, dailyOrders, …). The rules keep
 * those read-only for the main admin, who copies them into a new room here.
 * Nothing in the old collections is changed, so they stay as a backup until
 * deleted with deleteV1House.
 */
import {
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { ROOM_COLLECTIONS, V1_COLLECTIONS, type RoomCollection } from "@/constants/firestore";
import { V1_MEAL_SETTINGS } from "@/constants/meals";
import type { GoogleAccount, MealPrices } from "@/types";

import { asText, myRoomRef, roomDoc, roomRef } from "./refs";
import { deleteInBatches, isRoomIdAvailable, RoomNameTakenError } from "./roomAdminService";

const BATCH_SIZE = 400;

export type MoveSummary = {
  roomId: string;
  members: number;
  orders: number;
  debts: number;
  settlements: number;
  requests: number;
};

const readAll = async (name: string) => (await getDocs(collection(db, name))).docs;

/** Whether the v1 house is still in the database. */
export async function hasV1House(): Promise<boolean> {
  const snapshot = await getDocs(query(collection(db, V1_COLLECTIONS.users), limit(1)));
  return !snapshot.empty;
}

type Write = { ref: DocumentReference; data: DocumentData };

async function commitInBatches(writes: Write[], onProgress: (done: number) => void) {
  for (let start = 0; start < writes.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = writes.slice(start, start + BATCH_SIZE);
    chunk.forEach(({ ref, data }) => batch.set(ref, data));
    await batch.commit();
    onProgress(start + chunk.length);
  }
}

/**
 * Copies the v1 house into a new room called `name`, with the main admin
 * (the signed-in account) as its admin. Everyone keeps their account, due,
 * orders, debts and payment history, and people still waiting for access
 * become join requests. Meal prices start at v1's (breakfast ₹50, lunch ₹60).
 */
export async function moveV1House(
  account: GoogleAccount,
  room: { roomId: string; name: string },
  onProgress: (done: number, total: number) => void = () => {}
): Promise<MoveSummary> {
  if (!(await isRoomIdAvailable(room.roomId))) throw new RoomNameTakenError();

  const [users, roommates, orders, debts, settlements, requests] = await Promise.all([
    readAll(V1_COLLECTIONS.users),
    readAll(V1_COLLECTIONS.roommates),
    readAll(V1_COLLECTIONS.dailyOrders),
    readAll(V1_COLLECTIONS.debts),
    readAll(V1_COLLECTIONS.settlements),
    readAll(V1_COLLECTIONS.accessRequests),
  ]);

  // v1 approved people with a users/{uid} document; roommates/{uid} had the shared name.
  const roommateNames = new Map(roommates.map((document) => [document.id, asText(document.data().name)]));
  const nameOf = (uid: string) => {
    const user = users.find((document) => document.id === uid)?.data();
    return asText(user?.name) ?? roommateNames.get(uid) ?? DEFAULT_ROOMMATE_NAME;
  };

  const toMember = (document: QueryDocumentSnapshot) => {
    const data = document.data();
    return {
      name: nameOf(document.id),
      email: asText(data.email),
      outstandingBalance: Number(data.outstandingBalance ?? 0),
      joinedAt: data.approvedAt ?? serverTimestamp(),
    };
  };

  const inRoom = (name: RoomCollection, id: string) => roomDoc(room.roomId, name, id);
  const myV1Account = users.find((document) => document.id === account.uid);
  const adminName = myV1Account ? nameOf(account.uid) : account.displayName || DEFAULT_ROOMMATE_NAME;

  // First the room with its admin, so the rules recognise the room for the rest.
  await commitInBatches(
    [
      {
        ref: roomRef(room.roomId),
        data: {
          name: room.name,
          adminUid: account.uid,
          adminName,
          meals: V1_MEAL_SETTINGS,
          vendorUpi: "",
          createdAt: serverTimestamp(),
        },
      },
      {
        ref: inRoom(ROOM_COLLECTIONS.members, account.uid),
        data: myV1Account
          ? toMember(myV1Account)
          : { name: adminName, email: account.email, outstandingBalance: 0, joinedAt: serverTimestamp() },
      },
    ],
    () => {}
  );

  const writes: Write[] = [
    ...users
      .filter((document) => document.id !== account.uid)
      .map((document) => ({ ref: inRoom(ROOM_COLLECTIONS.members, document.id), data: toMember(document) })),

    // Everyone, you included, finds the room by signing in on the home page.
    ...users.map((document) => ({
      ref: myRoomRef(document.id, room.roomId),
      data: { name: room.name, updatedAt: serverTimestamp() },
    })),

    ...orders.map((document) => {
      const data = document.data();
      const breakfast = data.breakfast === true;
      const lunch = data.lunch === true;
      // v1 prices were fixed, so this is what each meal cost.
      const prices: MealPrices = {};
      if (breakfast) prices.breakfast = V1_MEAL_SETTINGS.breakfast.price;
      if (lunch) prices.lunch = V1_MEAL_SETTINGS.lunch.price;

      return {
        ref: inRoom(ROOM_COLLECTIONS.orders, document.id),
        data: {
          userId: data.userId,
          userName: data.userName ?? nameOf(String(data.userId)),
          deliveryDate: data.deliveryDate,
          breakfast,
          lunch,
          dinner: false,
          prices,
          amount: Number(data.amount ?? 0),
          status: data.status ?? "ordered",
          updatedAt: data.updatedAt ?? serverTimestamp(),
        },
      };
    }),

    ...debts.map((document) => {
      const data = document.data();
      const pair: string[] = Array.isArray(data.users) ? data.users : [];
      return {
        ref: inRoom(ROOM_COLLECTIONS.debts, document.id),
        data: {
          users: pair,
          names: Object.fromEntries(pair.map((uid) => [uid, nameOf(uid)])),
          amount: Number(data.amount ?? 0),
          updatedAt: data.updatedAt ?? serverTimestamp(),
        },
      };
    }),

    ...settlements.map((document) => ({
      ref: inRoom(ROOM_COLLECTIONS.settlements, document.id),
      data: document.data(),
    })),

    ...requests.map((document) => ({
      ref: inRoom(ROOM_COLLECTIONS.joinRequests, document.id),
      data: document.data(),
    })),
  ];

  await commitInBatches(writes, (done) => onProgress(done, writes.length));

  return {
    roomId: room.roomId,
    members: users.length,
    orders: orders.length,
    debts: debts.length,
    settlements: settlements.length,
    requests: requests.length,
  };
}

/** Deletes the v1 collections for good. Only once the new room has been checked. */
export async function deleteV1House(): Promise<void> {
  for (const name of Object.values(V1_COLLECTIONS)) {
    const documents = await readAll(name);
    await deleteInBatches(documents.map((document) => document.ref));
  }
}
