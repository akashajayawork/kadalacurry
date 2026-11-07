/** Rooms opened on this device, newest first, so the home page can link back to them. */
export type RecentRoom = { id: string; name: string };

const STORAGE_KEY = "kadalacurry.recentRooms";
const MAX_ROOMS = 5;

export function getRecentRooms(): RecentRoom[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored)
      ? stored.filter((room) => typeof room?.id === "string" && typeof room?.name === "string")
      : [];
  } catch {
    return [];
  }
}

export function rememberRoom(room: RecentRoom): void {
  try {
    const others = getRecentRooms().filter((item) => item.id !== room.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([room, ...others].slice(0, MAX_ROOMS)));
  } catch {
    // Private browsing or storage turned off: nothing to remember.
  }
}

export function forgetRoom(roomId: string): void {
  try {
    const rooms = getRecentRooms().filter((item) => item.id !== roomId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // As above.
  }
}
