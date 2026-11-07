import "../admin.css";

type VendorUpiFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/** Where the house pays the meal bill. Only the room admin sets it. */
export function VendorUpiField({ value, onChange, disabled = false }: VendorUpiFieldProps) {
  return (
    <label className="field vendor-upi-field">
      <span className="field-label">Vendor's UPI ID or phone number</span>
      <input
        className="field-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. vendorname@okaxis"
        maxLength={100}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={disabled}
      />
      <span className="setup-hint">
        Settling the total due opens Google Pay with this and the amount filled in. A UPI ID
        works best; with a phone number, people pay it by hand.
      </span>
    </label>
  );
}
