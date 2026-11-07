import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useToast } from "@/components/feedback";
import { useRoom } from "@/features/rooms";
import { updateRoomSettings } from "@/services/roomService";
import type { RoomSettings } from "@/types";

import { getSettingsProblem, normalizeSettings } from "../utils/settings";
import { MealSettingsFields } from "./MealSettingsFields";
import { VendorUpiField } from "./VendorUpiField";

/** Room admin: meals, prices and the vendor's UPI. All of it can change any time. */
export function RoomSettingsForm() {
  const { roomId, room } = useRoom();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<RoomSettings>({
    meals: room.meals,
    vendorUpi: room.vendorUpi,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify({ meals: room.meals, vendorUpi: room.vendorUpi });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isDirty || saving) return;

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

  return (
    <form className="setup-section" onSubmit={handleSubmit} aria-labelledby="room-settings-title">
      <div className="setup-section-header">
        <h3 id="room-settings-title" className="setup-section-title">
          Meals & prices
        </h3>
      </div>
      <p className="setup-hint">
        A fixed price per person. New prices apply to meals ordered from now on.
      </p>

      <MealSettingsFields
        value={settings.meals}
        onChange={(meals) => setSettings((current) => ({ ...current, meals }))}
        disabled={saving}
      />

      <VendorUpiField
        value={settings.vendorUpi}
        onChange={(vendorUpi) => setSettings((current) => ({ ...current, vendorUpi }))}
        disabled={saving}
      />

      {error && <p className="form-error">{error}</p>}

      <button
        type="submit"
        className="button button-primary button-block setup-save"
        disabled={!isDirty || saving}
      >
        {saving ? <LoaderCircle size={18} className="spin" /> : isDirty ? "Save changes" : "Saved"}
      </button>
    </form>
  );
}
