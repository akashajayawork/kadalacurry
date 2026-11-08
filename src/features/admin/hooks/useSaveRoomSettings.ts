import { useState } from "react";

import { useToast } from "@/components/feedback";
import { useRoom } from "@/features/rooms";
import { updateRoomSettings } from "@/services/roomService";
import type { RoomSettings } from "@/types";

import { getSettingsProblem, normalizeSettings } from "../utils/settings";

/**
 * Saves part of the room's settings (meals or the vendor's UPI), keeping the
 * rest as the room has it now. Checks them first, like the rules do.
 */
export function useSaveRoomSettings() {
  const { roomId, room } = useRoom();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (change: Partial<RoomSettings>) => {
    const settings: RoomSettings = { meals: room.meals, vendorUpi: room.vendorUpi, ...change };
    const problem = getSettingsProblem(settings);
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateRoomSettings(roomId, normalizeSettings(settings));
      showToast("Room updated", "success");
    } catch (saveError) {
      console.error("Saving room settings failed:", saveError);
      setError("Couldn't save right now. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}
