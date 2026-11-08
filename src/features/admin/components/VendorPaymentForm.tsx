import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useRoom } from "@/features/rooms";

import { useSaveRoomSettings } from "../hooks/useSaveRoomSettings";
import { CollapsibleSection } from "./CollapsibleSection";
import { VendorUpiField } from "./VendorUpiField";

/** Room admin: where the house pays the meal bill. */
export function VendorPaymentForm() {
  const { room } = useRoom();
  const [vendorUpi, setVendorUpi] = useState(room.vendorUpi);
  const { save, saving, error } = useSaveRoomSettings();

  const isDirty = vendorUpi.trim() !== room.vendorUpi;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isDirty && !saving) void save({ vendorUpi });
  };

  return (
    <CollapsibleSection
      title="Vendor UPI"
      summary={
        room.vendorUpi || <span className="setup-toggle-warning">Not set: Google Pay is off</span>
      }
    >
      <form onSubmit={handleSubmit}>
        <VendorUpiField value={vendorUpi} onChange={setVendorUpi} disabled={saving} />

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="button button-primary button-block setup-save"
          disabled={!isDirty || saving}
        >
          {saving ? <LoaderCircle size={18} className="spin" /> : isDirty ? "Save UPI" : "Saved"}
        </button>
      </form>
    </CollapsibleSection>
  );
}
