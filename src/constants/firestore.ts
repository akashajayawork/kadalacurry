export const COLLECTIONS = {
  users: "users",
  roommates: "roommates",
  dailyOrders: "dailyOrders",
  debts: "debts",
  settlements: "settlements",
  accessRequests: "accessRequests",
  vendorBoard: "vendorBoard",
} as const;

/** The single public board document: vendorBoard/current. */
export const VENDOR_BOARD_ID = "current";
