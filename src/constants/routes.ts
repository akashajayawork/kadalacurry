/** "/" locally, "/<repo>/" on GitHub Pages. Always ends with a slash. */
const BASE = import.meta.env.BASE_URL;

/** Links within the site. Room links are just the room id: /kadala-house. */
export const PATHS = {
  home: BASE,
  admin: `${BASE}admin`,
  create: `${BASE}create`,
  demo: `${BASE}demo/`,
  room: (roomId: string) => `${BASE}${roomId}`,
  /** The public page for a room's meal vendor. */
  vendor: (roomId: string) => `${BASE}vendor.html?room=${encodeURIComponent(roomId)}`,
};

/** The full link, for copying and sharing. */
export const absoluteUrl = (path: string) => new URL(path, window.location.origin).href;

/**
 * Paths the site already uses, so no room can be called that. Keep in step
 * with the list in firestore.rules.
 */
export const RESERVED_ROOM_IDS: readonly string[] = [
  "admin",
  "api",
  "app",
  "assets",
  "create",
  "demo",
  "help",
  "index",
  "login",
  "new",
  "room",
  "rooms",
  "vendor",
];
