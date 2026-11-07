/** Top-level collections. */
export const COLLECTIONS = {
  rooms: "rooms",
  roomRequests: "roomRequests",
  vendorBoards: "vendorBoards",
} as const;

/** Collections inside each rooms/{roomId}. */
export const ROOM_COLLECTIONS = {
  members: "members",
  orders: "orders",
  debts: "debts",
  settlements: "settlements",
  joinRequests: "joinRequests",
} as const;

export type RoomCollection = (typeof ROOM_COLLECTIONS)[keyof typeof ROOM_COLLECTIONS];

/**
 * The original single-house collections (v1). They stay read-only after the
 * update, until the main admin moves them into a room from /admin.
 */
export const V1_COLLECTIONS = {
  users: "users",
  roommates: "roommates",
  dailyOrders: "dailyOrders",
  debts: "debts",
  settlements: "settlements",
  accessRequests: "accessRequests",
  vendorBoard: "vendorBoard",
} as const;
