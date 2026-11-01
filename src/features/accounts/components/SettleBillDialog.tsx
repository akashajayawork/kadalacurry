import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui";
import { NothingToSettleError, settleHouseholdBill } from "@/services/settlementService";
import type { Person, Roommate } from "@/types";
import { formatRupees } from "@/utils/currency";
import { tapFeedback } from "@/utils/haptics";
import { getInitial } from "@/utils/name";

import { SettleSuccess } from "./SettleSuccess";

type SettleBillDialogProps = {
  open: boolean;
  onClose: () => void;
  payer: Person;
  roommates: Roommate[];
};

export function SettleBillDialog({ open, onClose, payer, roommates }: SettleBillDialogProps) {
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} dismissible={!busy} label="Settle total due">
      <SettleBillContent payer={payer} roommates={roommates} onBusyChange={setBusy} onClose={onClose} />
    </Dialog>
  );
}

type SettleBillContentProps = Omit<SettleBillDialogProps, "open"> & {
  onBusyChange: (busy: boolean) => void;
};

function SettleBillContent({ payer, roommates, onBusyChange, onClose }: SettleBillContentProps) {
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState("");
  // Captured on success: the roommates list resets to zero right after.
  const [result, setResult] = useState<{ amount: number; hasDebtors: boolean } | null>(null);

  const total = roommates.reduce((sum, roommate) => sum + roommate.outstandingBalance, 0);
  const others = roommates.filter(
    (roommate) => roommate.id !== payer.id && roommate.outstandingBalance !== 0
  );

  const handleSettle = async () => {
    setSettling(true);
    setError("");
    onBusyChange(true);

    try {
      const amount = await settleHouseholdBill(payer);
      setResult({ amount, hasDebtors: others.length > 0 });
      tapFeedback([12, 60, 18]);
    } catch (settleError) {
      console.error("Settling the bill failed:", settleError);
      setError(
        settleError instanceof NothingToSettleError
          ? "Everything's already settled."
          : "Couldn't settle right now. Check your connection and try again."
      );
    } finally {
      setSettling(false);
      onBusyChange(false);
    }
  };

  if (result) {
    return (
      <SettleSuccess
        title="Bill settled!"
        message={
          result.hasDebtors
            ? `You paid ${formatRupees(result.amount)}. Your roommates now owe you their share.`
            : `You paid ${formatRupees(result.amount)}.`
        }
        onDone={onClose}
      />
    );
  }

  return (
    <>
      <h2 className="dialog-title">Settle total due</h2>
      <p className="dialog-amount">{formatRupees(total)}</p>
      <p className="dialog-text">
        {others.length > 0
          ? "You pay the whole meal bill. Everyone's due resets to ₹0 and they'll owe you instead:"
          : "You pay the meal bill and your due resets to ₹0."}
      </p>

      {others.length > 0 && (
        <ul className="settle-preview">
          {others.map((roommate) => (
            <li key={roommate.id}>
              <span className="avatar">{getInitial(roommate.name)}</span>
              <span className="settle-preview-name">{roommate.name}</span>
              <span className="settle-preview-amount">{formatRupees(roommate.outstandingBalance)}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="dialog-actions">
        <button
          type="button"
          className="button button-primary button-block"
          onClick={handleSettle}
          disabled={settling}
        >
          {settling ? <LoaderCircle size={18} className="spin" /> : `Settle ${formatRupees(total)}`}
        </button>
        <button
          type="button"
          className="button button-secondary button-block"
          onClick={onClose}
          disabled={settling}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
