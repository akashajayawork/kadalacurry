import { createContext } from "react";

import type { AppUser, Room } from "@/types";

/** The room being used, for someone who's a member of it. */
export type RoomContextValue = {
  roomId: string;
  room: Room;
  /** The signed-in member, under their name in this room. */
  user: AppUser;
  isRoomAdmin: boolean;
};

export const RoomContext = createContext<RoomContextValue | null>(null);
