import { useContext } from "react";

import type { AppUser } from "@/types";

import { RoomContext } from "../context/RoomContext";

/** The current room. Only use inside screens rendered by <RoomSession>. */
export function useRoom() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRoom must be used inside <RoomSession>.");
  }

  return context;
}

/** The signed-in member of the current room. */
export function useCurrentUser(): AppUser {
  return useRoom().user;
}
