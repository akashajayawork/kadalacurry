import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { DEFAULT_MEAL_SETTINGS } from "@/constants/meals";
import { PATHS } from "@/constants/routes";
import { getSettingsProblem, MealSettingsFields, normalizeSettings, VendorUpiField } from "@/features/admin";
import { AuthCard, useAccount } from "@/features/auth";
import { createRoom, RoomNameTakenError } from "@/services/roomAdminService";
import type { RoomSettings } from "@/types";
import { getFirstName } from "@/utils/name";

import { useRoomNameCheck } from "../hooks/useRoomNameCheck";
import { RoomNameField } from "./RoomNameField";

/** Step 1: the room's name (permanent) and your name. Step 2: meals, prices and the vendor's UPI. */
export function CreateRoomForm() {
  const account = useAccount();
  const [step, setStep] = useState<"name" | "setup">("name");
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState(() =>
    account.displayName ? getFirstName(account.displayName) : ""
  );
  const [settings, setSettings] = useState<RoomSettings>({ meals: DEFAULT_MEAL_SETTINGS, vendorUpi: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const trimmedName = name.trim();
  const nameCheck = useRoomNameCheck(name);
  const { roomId } = nameCheck;
  const canContinue = nameCheck.isAvailable && adminName.trim().length > 0;

  const handleNext = (event: FormEvent) => {
    event.preventDefault();
    if (!canContinue) return;
    setError("");
    setStep("setup");
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (creating) return;

    const problem = getSettingsProblem(settings);
    if (problem) {
      setError(problem);
      return;
    }

    setCreating(true);
    setError("");

    try {
      await createRoom(account, {
        roomId,
        name: trimmedName,
        adminName: adminName.trim(),
        ...normalizeSettings(settings),
      });
      window.location.assign(PATHS.room(roomId));
    } catch (createError) {
      console.error("Creating the room failed:", createError);
      setCreating(false);

      if (createError instanceof RoomNameTakenError) {
        setStep("name");
        setError("Someone just took that name. Try another.");
      } else {
        setError("Couldn't create the room right now. Check your connection and try again.");
      }
    }
  };

  if (step === "setup") {
    return (
      <AuthCard>
        <p className="eyebrow">Step 2 of 2</p>
        <h1 className="auth-title">Meals & prices</h1>
        <p className="auth-text">
          What your house orders, at a fixed price per person. You can change these any time.
        </p>

        <form className="create-room-form" onSubmit={handleCreate}>
          <MealSettingsFields
            value={settings.meals}
            onChange={(meals) => setSettings((current) => ({ ...current, meals }))}
            disabled={creating}
          />
          <VendorUpiField
            value={settings.vendorUpi}
            onChange={(vendorUpi) => setSettings((current) => ({ ...current, vendorUpi }))}
            disabled={creating}
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="button button-primary button-block" disabled={creating}>
            {creating ? <LoaderCircle size={18} className="spin" /> : `Create “${trimmedName}”`}
          </button>
          <button
            type="button"
            className="button button-secondary button-block"
            onClick={() => setStep("name")}
            disabled={creating}
          >
            Back
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <p className="eyebrow">Step 1 of 2</p>
      <h1 className="auth-title">Name your room</h1>
      <p className="auth-text">Usually your house or flat. Everyone sees it, and it's the room's link.</p>

      <form className="create-room-form" onSubmit={handleNext}>
        <RoomNameField value={name} onChange={setName} check={nameCheck} />

        <label className="field">
          <span className="field-label">Your name in the room</span>
          <input
            className="field-input"
            value={adminName}
            onChange={(event) => setAdminName(event.target.value)}
            placeholder="e.g. Rahul"
            maxLength={40}
            autoComplete="given-name"
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="button button-primary button-block" disabled={!canContinue}>
          Next
        </button>
      </form>
    </AuthCard>
  );
}
