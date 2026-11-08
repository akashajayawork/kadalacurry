import { Check, Lock, X } from "lucide-react";

import { PATHS } from "@/constants/routes";
import type { Availability } from "@/hooks/useRoomIdAvailability";
import { ROOM_NAME_MAX_LENGTH } from "@/utils/roomName";

import type { RoomNameCheck } from "../hooks/useRoomNameCheck";

import "../create-room.css";

const AVAILABILITY_TEXT: Record<Availability, string> = {
  idle: "",
  checking: "Checking…",
  available: "Available",
  taken: "Already taken",
  error: "Couldn't check",
};

type RoomNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
  check: RoomNameCheck;
  disabled?: boolean;
};

/** The room's name, its link, whether it's free, and a clear note that it's permanent. */
export function RoomNameField({ value, onChange, check, disabled = false }: RoomNameFieldProps) {
  const { roomId, problem, availability } = check;

  return (
    <>
      <label className="field">
        <span className="field-label">Room name</span>
        <input
          className="field-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. Kadala House"
          maxLength={ROOM_NAME_MAX_LENGTH + 10}
          autoComplete="off"
          disabled={disabled}
          required
        />
      </label>

      {value.trim() && (
        <p className={`room-name-status is-${problem ? "taken" : availability}`} role="status">
          <span className="room-name-link">
            {window.location.host}
            {PATHS.room(roomId || "…")}
          </span>
          <span className="room-name-availability">
            {availability === "available" && <Check size={14} strokeWidth={2.8} />}
            {(availability === "taken" || problem) && <X size={14} strokeWidth={2.8} />}
            {problem ?? AVAILABILITY_TEXT[availability]}
          </span>
        </p>
      )}

      <div className="permanent-note">
        <Lock size={16} strokeWidth={2.4} />
        <p>
          <strong>The room name can't be changed later.</strong> It stays the room's name and link
          for good. Meals, prices and roommates can change any time.
        </p>
      </div>
    </>
  );
}
