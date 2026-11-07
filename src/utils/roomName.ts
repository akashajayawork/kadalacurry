import { RESERVED_ROOM_IDS } from "@/constants/routes";

export const ROOM_NAME_MAX_LENGTH = 30;

/** Keep in step with the room id pattern in firestore.rules. */
const ROOM_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

/**
 * "Kadala House" → "kadala-house". The id is the room's document id and its
 * link, so two names with the same id count as the same name.
 */
export function toRoomId(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, ROOM_NAME_MAX_LENGTH)
    .replace(/-+$/, "");
}

/** Why a name can't be used, or null if it can (still subject to being free). */
export function getRoomNameProblem(name: string): string | null {
  const roomId = toRoomId(name);

  if (name.trim().length > ROOM_NAME_MAX_LENGTH) {
    return `Keep it under ${ROOM_NAME_MAX_LENGTH} characters.`;
  }
  if (roomId.length < 3) return "Use at least 3 letters or numbers.";
  if (!ROOM_ID_PATTERN.test(roomId) || RESERVED_ROOM_IDS.includes(roomId)) {
    return "That name isn't available. Try another.";
  }
  return null;
}
