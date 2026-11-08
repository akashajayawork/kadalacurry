/*
 * Security tests for firestore.rules, run against the Firestore emulator:
 *
 *   npm run test:rules
 *
 * Each test signs in as someone (or no one), tries one read or write, and
 * checks the rules allow or refuse it. Data is seeded fresh before each test.
 */
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

const MAIN_ADMIN_EMAIL = "akashajayawork@gmail.com";
const ROOM = "kadala-house";
const OTHER_ROOM = "other-room";

const MEALS = {
  breakfast: { enabled: true, price: 50 },
  lunch: { enabled: true, price: 60 },
  dinner: { enabled: false, price: 70 },
};

const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8085").split(":");

// Refused writes are the point of most tests; don't log each one.
setLogLevel("silent");

let env: RulesTestEnvironment;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-kadalacurry",
    firestore: {
      rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"),
      host,
      port: Number(port),
    },
  });
});

after(async () => {
  await env?.cleanup();
});

// ---------- People ----------

// The test library still types its contexts with the old compat API; the instances are the modular ones.
const firestoreOf = (context: RulesTestContext) => context.firestore() as unknown as Firestore;

/** Signed in with Google as `uid`. Google always verifies Gmail addresses. */
const as = (uid: string, email = `${uid}@example.com`, emailVerified = true): Firestore =>
  firestoreOf(env.authenticatedContext(uid, { email, email_verified: emailVerified }));

const mainAdmin = () => as("main", MAIN_ADMIN_EMAIL);
/** Someone who set the main admin's address on an account that isn't verified. */
const fakeMainAdmin = () => as("impostor", MAIN_ADMIN_EMAIL, false);
const alice = () => as("alice"); // admin of kadala-house
const bob = () => as("bob"); // member of kadala-house
const carol = () => as("carol"); // asked to join kadala-house
const olivia = () => as("olivia"); // admin of other-room
const dave = () => as("dave"); // room request pending
const erin = () => as("erin"); // room request approved
const stranger = () => as("stranger");
const anonymous = () => firestoreOf(env.unauthenticatedContext());

// ---------- Seed data ----------

const past = Timestamp.fromDate(new Date("2026-01-01T10:00:00Z"));
const member = (name: string, outstandingBalance = 0) => ({
  name,
  email: `${name.toLowerCase()}@example.com`,
  outstandingBalance,
  joinedAt: past,
});
const room = (name: string, adminUid: string) => ({
  name,
  adminUid,
  adminName: adminUid,
  meals: MEALS,
  vendorUpi: "vendor@okaxis",
  createdAt: past,
});
const request = (status: "pending" | "approved") => ({
  name: "Someone",
  email: "someone@example.com",
  photoURL: null,
  requestedAt: past,
  status,
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context: RulesTestContext) => {
    const db = firestoreOf(context);
    const batch = writeBatch(db);

    batch.set(doc(db, "rooms", ROOM), room("Kadala House", "alice"));
    batch.set(doc(db, "rooms", ROOM, "members", "alice"), member("Alice", 110));
    batch.set(doc(db, "rooms", ROOM, "members", "bob"), member("Bob", 60));
    batch.set(doc(db, "rooms", ROOM, "members", "paidup"), member("Paid Up", 0));
    batch.set(doc(db, "rooms", ROOM, "joinRequests", "carol"), {
      name: "Carol",
      email: "carol@example.com",
      photoURL: null,
      requestedAt: past,
    });
    batch.set(doc(db, "rooms", ROOM, "orders", "2026-01-02_bob"), order("bob", "2026-01-02"));
    batch.set(doc(db, "rooms", ROOM, "debts", "alice_bob"), { users: ["alice", "bob"], amount: 40 });
    batch.set(doc(db, "rooms", ROOM, "settlements", "s1"), {
      kind: "bill",
      amount: 300,
      createdBy: "alice",
      createdAt: past,
    });
    batch.set(doc(db, "vendorBoards", ROOM), vendorBoard());
    batch.set(doc(db, "userRooms", "bob", "rooms", ROOM), { name: "Kadala House", updatedAt: past });

    batch.set(doc(db, "rooms", OTHER_ROOM), room("Other Room", "olivia"));
    batch.set(doc(db, "rooms", OTHER_ROOM, "members", "olivia"), member("Olivia", 0));
    batch.set(doc(db, "rooms", OTHER_ROOM, "joinRequests", "stranger"), {
      name: "Stranger",
      email: null,
      photoURL: null,
      requestedAt: past,
    });

    batch.set(doc(db, "roomRequests", "dave"), request("pending"));
    batch.set(doc(db, "roomRequests", "erin"), request("approved"));

    // The original single-house app (v1).
    batch.set(doc(db, "users", "v1-admin"), { name: "Old Admin", outstandingBalance: 0, role: "admin" });
    batch.set(doc(db, "users", "v1-roommate"), { name: "Old Roommate", outstandingBalance: 50 });
    batch.set(doc(db, "roommates", "v1-roommate"), { name: "Old Roommate", outstandingBalance: 50 });
    batch.set(doc(db, "dailyOrders", "2026-01-02_v1-roommate"), {
      userId: "v1-roommate",
      deliveryDate: "2026-01-02",
      breakfast: true,
      lunch: false,
      amount: 50,
    });

    await batch.commit();
  });
});

function order(userId: string, deliveryDate: string, extra: Record<string, unknown> = {}) {
  return {
    userId,
    userName: userId,
    deliveryDate,
    breakfast: true,
    lunch: false,
    dinner: false,
    prices: { breakfast: 50 },
    amount: 50,
    status: "ordered",
    ...extra,
  };
}

function vendorBoard() {
  return { roomName: "Kadala House", meals: ["breakfast", "lunch"], totalDue: 170, days: {}, updatedAt: past };
}

/** A new room exactly as createRoom writes it, in one batch. */
function createRoomBatch(
  db: Firestore,
  uid: string,
  roomId: string,
  options: { useRequest?: boolean; roomData?: Record<string, unknown>; withMember?: boolean } = {}
) {
  const { useRequest = true, roomData = {}, withMember = true } = options;
  const batch = writeBatch(db);

  batch.set(doc(db, "rooms", roomId), {
    name: "New Room",
    adminUid: uid,
    adminName: "Creator",
    meals: MEALS,
    vendorUpi: "",
    createdAt: serverTimestamp(),
    ...roomData,
  });
  if (withMember) {
    batch.set(doc(db, "rooms", roomId, "members", uid), {
      name: "Creator",
      email: null,
      outstandingBalance: 0,
      joinedAt: serverTimestamp(),
    });
    batch.set(doc(db, "userRooms", uid, "rooms", roomId), {
      name: roomData.name ?? "New Room",
      updatedAt: serverTimestamp(),
    });
  }
  if (useRequest) batch.delete(doc(db, "roomRequests", uid));

  return batch.commit();
}

/** Approving a join request exactly as approveJoinRequest does. */
function approveBatch(db: Firestore, roomId: string, uid: string, options: { deleteRequest?: boolean } = {}) {
  const batch = writeBatch(db);
  batch.set(doc(db, "rooms", roomId, "members", uid), {
    name: "Carol",
    email: "carol@example.com",
    outstandingBalance: 0,
    joinedAt: serverTimestamp(),
  });
  if (options.deleteRequest ?? true) batch.delete(doc(db, "rooms", roomId, "joinRequests", uid));
  return batch.commit();
}

const roomDoc = (db: Firestore, ...path: string[]) => doc(db, "rooms", ROOM, ...path);

// ---------- Tests ----------

describe("main admin", () => {
  test("is recognised by verified email", async () => {
    await assertSucceeds(getDocs(collection(mainAdmin(), "roomRequests")));
    await assertSucceeds(getDocs(collection(mainAdmin(), "rooms")));
  });

  test("an unverified account with the same email is not the main admin", async () => {
    await assertFails(getDocs(collection(fakeMainAdmin(), "roomRequests")));
    await assertFails(getDocs(collection(fakeMainAdmin(), "rooms")));
    await assertFails(updateDoc(doc(fakeMainAdmin(), "roomRequests", "dave"), { status: "approved", approvedAt: serverTimestamp() }));
    await assertFails(deleteDoc(doc(fakeMainAdmin(), "rooms", ROOM)));
  });

  test("can read and delete anything in any room", async () => {
    const db = mainAdmin();
    await assertSucceeds(getDocs(collection(db, "rooms", ROOM, "members")));
    await assertSucceeds(getDocs(collection(db, "rooms", ROOM, "debts")));
    await assertSucceeds(deleteDoc(doc(db, "rooms", ROOM, "orders", "2026-01-02_bob")));
    await assertSucceeds(deleteDoc(doc(db, "vendorBoards", ROOM)));
    await assertSucceeds(deleteDoc(doc(db, "rooms", ROOM)));
  });

  test("can't write inside someone else's room", async () => {
    await assertFails(updateDoc(doc(mainAdmin(), "rooms", ROOM, "members", "bob"), { outstandingBalance: 999 }));
    await assertFails(updateDoc(doc(mainAdmin(), "rooms", ROOM), { meals: MEALS, vendorUpi: "me@okaxis" }));
  });

  test("can create a room without a request, and write anything in it (moving the original house)", async () => {
    const db = mainAdmin();
    await assertSucceeds(createRoomBatch(db, "main", "akash-house", { useRequest: false }));
    await assertSucceeds(setDoc(doc(db, "rooms", "akash-house", "members", "v1-roommate"), member("Old Roommate", 50)));
    await assertSucceeds(setDoc(doc(db, "rooms", "akash-house", "settlements", "old"), { kind: "bill", amount: 10, createdAt: past }));
  });
});

describe("room requests (/create)", () => {
  test("anyone signed in can ask for a room, as pending, for themselves only", async () => {
    const pending = { name: "S", email: "s@example.com", photoURL: null, requestedAt: serverTimestamp(), status: "pending" };
    await assertSucceeds(setDoc(doc(stranger(), "roomRequests", "stranger"), pending));
    await assertFails(setDoc(doc(stranger(), "roomRequests", "someone-else"), pending));
    await assertFails(setDoc(doc(anonymous(), "roomRequests", "stranger"), pending));
  });

  test("you can't approve your own request", async () => {
    const approved = { name: "S", email: null, photoURL: null, requestedAt: serverTimestamp(), status: "approved" };
    await assertFails(setDoc(doc(stranger(), "roomRequests", "stranger"), approved));
    await assertFails(updateDoc(doc(dave(), "roomRequests", "dave"), { status: "approved" }));
  });

  test("only the main admin approves and lists requests", async () => {
    const approve = { status: "approved", approvedAt: serverTimestamp() };
    await assertFails(updateDoc(doc(alice(), "roomRequests", "dave"), approve));
    await assertFails(getDocs(collection(alice(), "roomRequests")));
    await assertSucceeds(updateDoc(doc(mainAdmin(), "roomRequests", "dave"), approve));
  });

  test("you can see your own request, not other people's", async () => {
    await assertSucceeds(getDoc(doc(dave(), "roomRequests", "dave")));
    await assertFails(getDoc(doc(dave(), "roomRequests", "erin")));
  });

  test("the main admin can decline (delete) a request", async () => {
    await assertSucceeds(deleteDoc(doc(mainAdmin(), "roomRequests", "dave")));
  });
});

describe("creating a room", () => {
  test("an approved request lets you create one room, using the request up", async () => {
    await assertSucceeds(createRoomBatch(erin(), "erin", "erins-flat"));
  });

  test("the request has to be used up in the same write", async () => {
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { useRequest: false }));
  });

  test("a pending request, or none, isn't enough", async () => {
    await assertFails(createRoomBatch(dave(), "dave", "daves-flat"));
    await assertFails(createRoomBatch(stranger(), "stranger", "strangers-flat", { useRequest: false }));
  });

  test("room names are unique: an existing room can't be created again", async () => {
    await assertFails(createRoomBatch(erin(), "erin", ROOM));
  });

  test("reserved and malformed ids are refused", async () => {
    await assertFails(createRoomBatch(erin(), "erin", "admin"));
    await assertFails(createRoomBatch(erin(), "erin", "demo"));
    await assertFails(createRoomBatch(erin(), "erin", "Not-Lowercase"));
    await assertFails(createRoomBatch(erin(), "erin", "ab"));
  });

  test("the creator must be the admin and add themselves as the first member", async () => {
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { adminUid: "someone-else" } }));
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { withMember: false }));
  });

  test("meals must be breakfast, lunch and dinner with sensible prices, at least one on", async () => {
    const off = { enabled: false, price: 50 };
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { meals: { ...MEALS, lunch: { enabled: true, price: 0 } } } }));
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { meals: { ...MEALS, lunch: { enabled: true, price: 49.5 } } } }));
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { meals: { breakfast: off, lunch: off, dinner: off } } }));
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { meals: { ...MEALS, snacks: off } } }));
  });

  test("extra fields are refused", async () => {
    await assertFails(createRoomBatch(erin(), "erin", "erins-flat", { roomData: { plan: "free" } }));
  });
});

describe("rooms", () => {
  test("anyone signed in can look a room up by id; nobody signed out", async () => {
    await assertSucceeds(getDoc(doc(stranger(), "rooms", ROOM)));
    await assertSucceeds(getDoc(doc(stranger(), "rooms", "no-such-room")));
    await assertFails(getDoc(doc(anonymous(), "rooms", ROOM)));
  });

  test("only the main admin can list every room", async () => {
    await assertFails(getDocs(collection(alice(), "rooms")));
  });

  test("the room admin can change meals, prices and the vendor's UPI", async () => {
    const meals = { ...MEALS, dinner: { enabled: true, price: 80 } };
    await assertSucceeds(updateDoc(doc(alice(), "rooms", ROOM), { meals, vendorUpi: "9876543210" }));
  });

  test("the room name and admin can never change", async () => {
    await assertFails(updateDoc(doc(alice(), "rooms", ROOM), { name: "Renamed" }));
    await assertFails(updateDoc(doc(alice(), "rooms", ROOM), { adminUid: "bob" }));
  });

  test("members can't change the room's settings", async () => {
    await assertFails(updateDoc(doc(bob(), "rooms", ROOM), { vendorUpi: "bob@okaxis" }));
  });

  test("only the main admin deletes a room", async () => {
    await assertFails(deleteDoc(doc(alice(), "rooms", ROOM)));
  });
});

describe("members", () => {
  test("members see each other; outsiders only see whether they're in", async () => {
    await assertSucceeds(getDocs(collection(bob(), "rooms", ROOM, "members")));
    await assertFails(getDocs(collection(stranger(), "rooms", ROOM, "members")));
    await assertFails(getDoc(roomDoc(stranger(), "members", "bob")));
    await assertSucceeds(getDoc(roomDoc(stranger(), "members", "stranger")));
  });

  test("the room admin approves someone who asked, removing their request", async () => {
    await assertSucceeds(approveBatch(alice(), ROOM, "carol"));
  });

  test("the request must be removed in the same write", async () => {
    await assertFails(approveBatch(alice(), ROOM, "carol", { deleteRequest: false }));
  });

  test("nobody can be added without asking first", async () => {
    await assertFails(approveBatch(alice(), ROOM, "stranger"));
  });

  test("only the room admin can approve", async () => {
    await assertFails(approveBatch(bob(), ROOM, "carol"));
    await assertFails(approveBatch(carol(), ROOM, "carol"));
  });

  test("a room admin can't approve people in another room", async () => {
    await assertFails(approveBatch(alice(), OTHER_ROOM, "stranger"));
  });

  test("new members start with no due", async () => {
    const db = alice();
    const batch = writeBatch(db);
    batch.set(roomDoc(db, "members", "carol"), { name: "Carol", email: null, outstandingBalance: 500, joinedAt: serverTimestamp() });
    batch.delete(roomDoc(db, "joinRequests", "carol"));
    await assertFails(batch.commit());
  });

  test("you can move your own due, but never below zero", async () => {
    await assertSucceeds(updateDoc(roomDoc(bob(), "members", "bob"), { outstandingBalance: 110 }));
    await assertFails(updateDoc(roomDoc(bob(), "members", "bob"), { outstandingBalance: -10 }));
  });

  test("others can only zero your due (settling the bill), nothing else", async () => {
    await assertSucceeds(updateDoc(roomDoc(alice(), "members", "bob"), { outstandingBalance: 0 }));
    await assertFails(updateDoc(roomDoc(alice(), "members", "bob"), { outstandingBalance: 500 }));
    await assertFails(updateDoc(roomDoc(stranger(), "members", "bob"), { outstandingBalance: 0 }));
  });

  test("names can't be changed by members", async () => {
    await assertFails(updateDoc(roomDoc(bob(), "members", "bob"), { name: "Robert" }));
  });

  test("the room admin removes people once their due is paid", async () => {
    await assertSucceeds(deleteDoc(roomDoc(alice(), "members", "paidup")));
    await assertFails(deleteDoc(roomDoc(alice(), "members", "bob")));
  });

  test("the room admin can't remove themselves, and members can't remove anyone", async () => {
    await assertFails(deleteDoc(roomDoc(alice(), "members", "alice")));
    await assertFails(deleteDoc(roomDoc(bob(), "members", "paidup")));
  });

  test("someone removed loses access straight away", async () => {
    await assertSucceeds(getDocs(collection(as("paidup"), "rooms", ROOM, "orders")));
    await deleteDoc(roomDoc(alice(), "members", "paidup"));
    await assertFails(getDocs(collection(as("paidup"), "rooms", ROOM, "orders")));
  });
});

describe("join requests", () => {
  const joinRequest = { name: "S", email: "s@example.com", photoURL: null, requestedAt: serverTimestamp() };

  test("anyone signed in can ask to join a room, for themselves only", async () => {
    await assertSucceeds(setDoc(roomDoc(stranger(), "joinRequests", "stranger"), joinRequest));
    await assertFails(setDoc(roomDoc(stranger(), "joinRequests", "someone-else"), joinRequest));
    await assertFails(setDoc(roomDoc(anonymous(), "joinRequests", "stranger"), joinRequest));
  });

  test("not to a room that doesn't exist, nor one you're already in", async () => {
    await assertFails(setDoc(doc(stranger(), "rooms", "no-such-room", "joinRequests", "stranger"), joinRequest));
    await assertFails(setDoc(roomDoc(bob(), "joinRequests", "bob"), joinRequest));
  });

  test("only the room admin sees and declines them", async () => {
    await assertSucceeds(getDocs(collection(alice(), "rooms", ROOM, "joinRequests")));
    await assertFails(getDocs(collection(bob(), "rooms", ROOM, "joinRequests")));
    await assertFails(getDocs(collection(olivia(), "rooms", ROOM, "joinRequests")));
    await assertSucceeds(deleteDoc(roomDoc(alice(), "joinRequests", "carol")));
  });
});

describe("orders", () => {
  test("members save their own orders, with dinner and prices", async () => {
    await assertSucceeds(setDoc(roomDoc(bob(), "orders", "2026-01-03_bob"), order("bob", "2026-01-03", { dinner: true })));
  });

  test("not for someone else, and not with a wrong id", async () => {
    await assertFails(setDoc(roomDoc(alice(), "orders", "2026-01-03_bob"), order("bob", "2026-01-03")));
    await assertFails(setDoc(roomDoc(bob(), "orders", "2026-01-04_bob"), order("bob", "2026-01-03")));
    await assertFails(updateDoc(roomDoc(alice(), "orders", "2026-01-02_bob"), { amount: 0 }));
  });

  test("an order needs all three meals and its prices", async () => {
    const withoutDinner: Record<string, unknown> = order("bob", "2026-01-03");
    const withoutPrices: Record<string, unknown> = order("bob", "2026-01-03");
    delete withoutDinner.dinner;
    delete withoutPrices.prices;
    await assertFails(setDoc(roomDoc(bob(), "orders", "2026-01-03_bob"), withoutDinner));
    await assertFails(setDoc(roomDoc(bob(), "orders", "2026-01-03_bob"), withoutPrices));
  });

  test("outsiders can't read or write orders, and nobody deletes them", async () => {
    await assertFails(getDocs(collection(stranger(), "rooms", ROOM, "orders")));
    await assertFails(setDoc(roomDoc(stranger(), "orders", "2026-01-03_stranger"), order("stranger", "2026-01-03")));
    await assertFails(deleteDoc(roomDoc(bob(), "orders", "2026-01-02_bob")));
  });

  test("a room admin can't read another room's orders", async () => {
    await assertFails(getDocs(collection(olivia(), "rooms", ROOM, "orders")));
  });
});

describe("debts and payment history", () => {
  test("you see only debts you're part of", async () => {
    const debts = collection(bob(), "rooms", ROOM, "debts");
    await assertSucceeds(getDocs(query(debts, where("users", "array-contains", "bob"))));
    await assertFails(getDocs(debts));
    await assertFails(getDoc(roomDoc(as("paidup"), "debts", "alice_bob")));
  });

  test("settling the bill: payment recorded, dues zeroed and debts added, together", async () => {
    const db = alice();
    const batch = writeBatch(db);
    batch.set(doc(collection(db, "rooms", ROOM, "settlements")), {
      kind: "bill",
      amount: 170,
      paidBy: "alice",
      paidVia: "gpay",
      createdBy: "alice",
      createdAt: serverTimestamp(),
    });
    batch.update(roomDoc(db, "members", "alice"), { outstandingBalance: 0 });
    batch.update(roomDoc(db, "members", "bob"), { outstandingBalance: 0 });
    batch.set(roomDoc(db, "debts", "alice_bob"), {
      users: ["alice", "bob"],
      names: { alice: "Alice", bob: "Bob" },
      amount: -20,
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });

  test("a debt you're not part of can't be written", async () => {
    await assertFails(setDoc(roomDoc(as("paidup"), "debts", "alice_bob"), { users: ["alice", "bob"], amount: 0 }));
  });

  test("history is append-only and recorded as yourself", async () => {
    const entry = { kind: "repayment", amount: 40, createdBy: "bob", createdAt: serverTimestamp() };
    await assertSucceeds(setDoc(roomDoc(bob(), "settlements", "s2"), entry));
    await assertFails(setDoc(roomDoc(bob(), "settlements", "s3"), { ...entry, createdBy: "alice" }));
    await assertFails(updateDoc(roomDoc(alice(), "settlements", "s1"), { amount: 1 }));
    await assertFails(deleteDoc(roomDoc(alice(), "settlements", "s1")));
  });

  test("outsiders can't read the history", async () => {
    await assertFails(getDocs(collection(stranger(), "rooms", ROOM, "settlements")));
  });
});

describe("your rooms (the home page list)", () => {
  const entry = (name = "Kadala House") => ({ name, updatedAt: serverTimestamp() });
  const myRoom = (db: Firestore, uid: string, roomId = ROOM) => doc(db, "userRooms", uid, "rooms", roomId);

  test("members add rooms they're in to their own list, under the real name", async () => {
    await assertSucceeds(setDoc(myRoom(alice(), "alice"), entry()));
  });

  test("not rooms they aren't in, not under another name, not for someone else", async () => {
    await assertFails(setDoc(myRoom(stranger(), "stranger"), entry()));
    await assertFails(setDoc(myRoom(alice(), "alice"), entry("Fake Name")));
    await assertFails(setDoc(myRoom(alice(), "carol"), entry()));
    await assertFails(setDoc(myRoom(alice(), "alice", OTHER_ROOM), entry("Other Room")));
  });

  test("only you can see your list", async () => {
    await assertSucceeds(getDocs(collection(bob(), "userRooms", "bob", "rooms")));
    await assertFails(getDocs(collection(alice(), "userRooms", "bob", "rooms")));
    await assertFails(getDocs(collection(anonymous(), "userRooms", "bob", "rooms")));
  });

  test("the room admin takes it off someone's list when removing them; others can't", async () => {
    await assertFails(deleteDoc(myRoom(olivia(), "bob")));
    await assertFails(deleteDoc(myRoom(as("paidup"), "bob")));
    await assertSucceeds(deleteDoc(myRoom(alice(), "bob")));
  });

  test("you can drop rooms from your own list", async () => {
    await assertSucceeds(deleteDoc(myRoom(bob(), "bob")));
  });

  test("the main admin adds everyone's entry when moving the house into their own room", async () => {
    const db = mainAdmin();
    await assertSucceeds(createRoomBatch(db, "main", "akash-house", { useRequest: false, roomData: { name: "Akash House" } }));
    await assertSucceeds(setDoc(doc(db, "userRooms", "v1-roommate", "rooms", "akash-house"), entry("Akash House")));
    await assertFails(setDoc(doc(db, "userRooms", "v1-roommate", "rooms", ROOM), entry()));
  });
});

describe("demo visitors", () => {
  const visit = (name = "Priya") => ({ name, visitedAt: serverTimestamp() });
  const visitDoc = (db: Firestore, id = "AbCdEfGhIjKlMnOpQrSt") => doc(db, "demoVisits", id);

  test("the demo notes a visitor's name without signing in", async () => {
    await assertSucceeds(setDoc(visitDoc(anonymous()), visit()));
  });

  test("only a short name and the server's time", async () => {
    await assertFails(setDoc(visitDoc(anonymous()), { ...visit(), email: "x@example.com" }));
    await assertFails(setDoc(visitDoc(anonymous()), visit("")));
    await assertFails(setDoc(visitDoc(anonymous()), visit("x".repeat(31))));
    await assertFails(setDoc(visitDoc(anonymous()), { name: "Priya", visitedAt: past }));
    await assertFails(setDoc(visitDoc(anonymous(), "short"), visit()));
  });

  test("a visit can't be changed afterwards", async () => {
    await setDoc(visitDoc(anonymous()), visit());
    await assertFails(setDoc(visitDoc(anonymous()), visit("Someone else")));
  });

  test("only the main admin can see or clear the list", async () => {
    await setDoc(visitDoc(anonymous()), visit());
    await assertFails(getDocs(collection(anonymous(), "demoVisits")));
    await assertFails(getDocs(collection(alice(), "demoVisits")));
    await assertFails(getDocs(collection(fakeMainAdmin(), "demoVisits")));
    await assertSucceeds(getDocs(collection(mainAdmin(), "demoVisits")));
    await assertSucceeds(deleteDoc(visitDoc(mainAdmin())));
  });
});

describe("vendor boards", () => {
  test("anyone can read a room's board by its link, without signing in", async () => {
    await assertSucceeds(getDoc(doc(anonymous(), "vendorBoards", ROOM)));
  });

  test("but nobody can list the boards to find other rooms", async () => {
    await assertFails(getDocs(collection(anonymous(), "vendorBoards")));
    await assertFails(getDocs(collection(alice(), "vendorBoards")));
  });

  test("only the room's members update it, and only with totals", async () => {
    await assertSucceeds(setDoc(doc(bob(), "vendorBoards", ROOM), vendorBoard()));
    await assertFails(setDoc(doc(olivia(), "vendorBoards", ROOM), vendorBoard()));
    await assertFails(setDoc(doc(anonymous(), "vendorBoards", ROOM), vendorBoard()));
    await assertFails(setDoc(doc(bob(), "vendorBoards", ROOM), { ...vendorBoard(), names: ["Bob"] }));
  });
});

describe("the original single-house data (v1)", () => {
  test("the main admin can read it to move it, and delete it afterwards", async () => {
    await assertSucceeds(getDocs(collection(mainAdmin(), "users")));
    await assertSucceeds(getDocs(collection(mainAdmin(), "dailyOrders")));
    await assertSucceeds(deleteDoc(doc(mainAdmin(), "users", "v1-roommate")));
  });

  test("the old app keeps working for its roommates until the move", async () => {
    const roommate = as("v1-roommate");
    await assertSucceeds(getDocs(collection(roommate, "roommates")));
    await assertSucceeds(updateDoc(doc(roommate, "users", "v1-roommate"), { outstandingBalance: 100 }));
  });

  test("people who weren't in the old house can't read it", async () => {
    await assertFails(getDocs(collection(stranger(), "roommates")));
    await assertFails(getDocs(collection(alice(), "dailyOrders")));
  });
});
