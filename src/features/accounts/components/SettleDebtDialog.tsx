import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui";
import { useRoom } from "@/features/rooms";
import { NothingToSettleError, settleDebt } from "@/services/settlementService";
import type { Debt, Person } from "@/types";
import { formatRupees } from "@/utils/currency";
import { tapFeedback } from "@/utils/haptics";

import { SettleSuccess } from "./SettleSuccess";

type SettleDebtDialogProps = {
  /** The debt to settle, or null when closed. */
  debt: Debt | null;
  currentUser: Person;
  getName: (userId: string) => string;
  onClose: () => void;
};

export function SettleDebtDialog({ debt, currentUser, getName, onClose }: SettleDebtDialogProps) {
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={debt !== null} onClose={onClose} dismissible={!busy} label="Settle balance">
      {debt && (
        <SettleDebtContent
          debt={debt}
          currentUser={currentUser}
          otherUser={{ id: debt.otherUserId, name: getName(debt.otherUserId) }}
          onBusyChange={setBusy}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

type SettleDebtContentProps = {
  debt: Debt;
  currentUser: Person;
  otherUser: Person;
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
};

function SettleDebtContent({
  debt,
  currentUser,
  otherUser,
  onBusyChange,
  onClose,
}: SettleDebtContentProps) {
  const { roomId } = useRoom();
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState("");
  const [settledAmount, setSettledAmount] = useState<number | null>(null);

  const owesYou = debt.amount > 0;
  const amount = Math.abs(debt.amount);

  const handleSettle = async () => {
    setSettling(true);
    setError("");
    onBusyChange(true);

    try {
      setSettledAmount(await settleDebt(roomId, currentUser, otherUser));
      tapFeedback([12, 60, 18]);
    } catch (settleError) {
      console.error("Settling the debt failed:", settleError);
      setError(
        settleError instanceof NothingToSettleError
          ? "This is already settled."
          : "Couldn't settle right now. Check your connection and try again."
      );
    } finally {
      setSettling(false);
      onBusyChange(false);
    }
  };

  if (settledAmount !== null) {
    return (
      <SettleSuccess
        title="All square!"
        message={
          owesYou
            ? `${otherUser.name} paid you back ${formatRupees(settledAmount)}.`
            : `You paid ${otherUser.name} back ${formatRupees(settledAmount)}.`
        }
        onDone={onClose}
      />
    );
  }

  return (
    <>
      <h2 className="dialog-title">{owesYou ? `${otherUser.name} owes you` : `You owe ${otherUser.name}`}</h2>
      <p className={`dialog-amount ${owesYou ? "is-positive" : "is-negative"}`}>{formatRupees(amount)}</p>
      <p className="dialog-text">
        {owesYou ? `Got the money from ${otherUser.name}?` : `Paid ${otherUser.name} back?`} Settling
        clears this balance and adds it to the payment history.
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="dialog-actions">
        <button
          type="button"
          className="button button-primary button-block"
          onClick={handleSettle}
          disabled={settling}
        >
          {settling ? <LoaderCircle size={18} className="spin" /> : `Settle ${formatRupees(amount)}`}
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
