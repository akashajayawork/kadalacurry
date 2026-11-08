import { onSnapshot, Timestamp, updateDoc, type DocumentData } from "firebase/firestore";

import { DEFAULT_MEAL_SETTINGS, MEALS } from "@/constants/meals";
import type { MealSettings, Room, RoomSettings } from "@/types";

import { asText, roomRef } from "./refs";

function toMealSettings(data: unknown): MealSettings {
  const stored = (data ?? {}) as Partial<Record<string, { enabled?: unknown; price?: unknown }>>;
  const settings = { ...DEFAULT_MEAL_SETTINGS };

  for (const meal of MEALS) {
    const value = stored[meal];
    settings[meal] = {
      enabled: typeof value?.enabled === "boolean" ? value.enabled : false,
      price: typeof value?.price === "number" ? value.price : DEFAULT_MEAL_SETTINGS[meal].price,
    };
  }

  return settings;
}

export function toRoom(id: string, data: DocumentData): Room {
  return {
    id,
    name: asText(data.name) ?? id,
    adminUid: asText(data.adminUid) ?? "",
    adminName: asText(data.adminName) ?? "",
    meals: toMealSettings(data.meals),
    vendorUpi: asText(data.vendorUpi) ?? "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

/** Real-time room, or null if there's no room with this id. */
export function subscribeToRoom(
  roomId: string,
  onChange: (room: Room | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    roomRef(roomId),
    (snapshot) => onChange(snapshot.exists() ? toRoom(snapshot.id, snapshot.data()) : null),
    onError
  );
}

/** Room admin only. Meals, prices and the vendor's UPI can change any time; the name never can. */
export async function updateRoomSettings(roomId: string, settings: RoomSettings): Promise<void> {
  await updateDoc(roomRef(roomId), { meals: settings.meals, vendorUpi: settings.vendorUpi.trim() });
}
