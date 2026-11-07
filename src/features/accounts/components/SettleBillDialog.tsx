import { LoaderCircle, Smartphone } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui";
import { useRoom } from "@/features/rooms";
import { openUpiPayment } from "@/services/paymentService";
import {
  DueChangedError,
  NothingToSettleError,
  settleHouseholdBill,
} from "@/services/settlementService";
import type { PaymentMethod, Person, Roommate } from "@/types";
import { formatRupees } from "@/utils/currency";
import { tapFeedback } from "@/utils/haptics";
import { getInitial } from "@/utils/name";
import { parseUpiTarget, type UpiApp } from "@/utils/upi";

import { PaymentOptions } from "./PaymentOptions";
import { SettleSuccess } from "./SettleSuccess";

/** Shown in the UPI app as who's being paid. The app also shows the vendor's verified bank name. */
const PAYEE_NAME = "Meal vendor";

const APP_NAMES: Record<UpiApp, string> = { gpay: "Google Pay", upi: "your UPI app" };

const PAID_VIA_TEXT: Record<PaymentMethod, string> = {
  gpay: " with Google Pay",
  upi: " by UPI",
  other: "",
};

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

type Step =
  | { kind: "review" }
  /** Back from the UPI app: did it go through? */
  | { kind: "confirm"; app: UpiApp; amount: number; simulated: boolean }
  | { kind: "done"; amount: number; hasDebtors: boolean; paidVia: PaymentMethod };

type SettleBillContentProps = Omit<SettleBillDialogProps, "open"> & {
  onBusyChange: (busy: boolean) => void;
};

function SettleBillContent({ payer, roommates, onBusyChange, onClose }: SettleBillContentProps) {
  const { roomId, room, isRoomAdmin } = useRoom();
  const [step, setStep] = useState<Step>({ kind: "review" });
  const [settling, setSettling] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState("");

  const target = parseUpiTarget(room.vendorUpi);
  const total = roommates.reduce((sum, roommate) => sum + roommate.outstandingBalance, 0);
  const others = roommates.filter(
    (roommate) => roommate.id !== payer.id && roommate.outstandingBalance !== 0
  );

  /** Records the payment: everyone's due goes to zero and they owe the payer instead. */
  const settle = async (paidVia: PaymentMethod, expectedTotal?: number) => {
    setSettling(paidVia);
    setError("");
    onBusyChange(true);

    try {
      const amount = await settleHouseholdBill(roomId, payer, paidVia, expectedTotal);
      setStep({ kind: "done", amount, hasDebtors: others.length > 0, paidVia });
      tapFeedback([12, 60, 18]);
    } catch (settleError) {
      console.error("Settling the bill failed:", settleError);
      setStep({ kind: "review" });
      setError(
        settleError instanceof NothingToSettleError
          ? "Everything's already settled."
          : settleError instanceof DueChangedError
            ? `Someone changed their order while you were paying, so the due is now ${formatRupees(settleError.total)}. Pay the difference, then settle with "Paid another way".`
            : "Couldn't settle right now. Check your connection and try again."
      );
    } finally {
      setSettling(null);
      onBusyChange(false);
    }
  };

  const payWith = (app: UpiApp) => {
    if (target?.kind !== "upi-id") return;

    setError("");
    const launch = openUpiPayment(app, {
      upiId: target.upiId,
      payeeName: PAYEE_NAME,
      amount: total,
      note: `${room.name} meals`,
    });
    setStep({ kind: "confirm", app, amount: total, simulated: launch === "simulated" });
  };

  if (step.kind === "done") {
    return (
      <SettleSuccess
        title="Bill settled!"
        message={
          `You paid ${formatRupees(step.amount)}${PAID_VIA_TEXT[step.paidVia]}.` +
          (step.hasDebtors ? " Your roommates now owe you their share." : "")
        }
        onDone={onClose}
      />
    );
  }

  if (step.kind === "confirm") {
    const appName = APP_NAMES[step.app];

    return (
      <div className="pay-confirm">
        <span className="pay-confirm-icon" aria-hidden="true">
          <Smartphone size={24} strokeWidth={2.2} />
        </span>
        <h2 className="dialog-title">Did the payment go through?</h2>
        <p className="dialog-amount">{formatRupees(step.amount)}</p>
        <p className="dialog-text">
          {step.simulated
            ? `This is the demo, so ${appName} didn't really open. In the real app it opens with ${formatRupees(step.amount)} to the vendor already filled in.`
            : `Finish paying in ${appName}, then come back here.`}{" "}
          Only tap "Yes" once it says the payment was successful.
        </p>

        <div className="dialog-actions">
          <button
            type="button"
            className="button button-primary button-block"
            onClick={() => settle(step.app, step.amount)}
            disabled={settling !== null}
          >
            {settling ? <LoaderCircle size={18} className="spin" /> : "Yes, it's paid"}
          </button>
          <button
            type="button"
            className="button button-secondary button-block"
            onClick={() => payWith(step.app)}
            disabled={settling !== null}
          >
            Open {appName} again
          </button>
          <button
            type="button"
            className="button button-ghost button-block"
            onClick={() => setStep({ kind: "review" })}
            disabled={settling !== null}
          >
            It didn't work
          </button>
        </div>
      </div>
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

      <PaymentOptions
        target={target}
        total={total}
        settling={settling}
        missingHint={
          isRoomAdmin
            ? "Add the vendor's UPI ID in room setup (tap your avatar) to pay from here."
            : `Ask ${room.adminName || "the room admin"} to add the vendor's UPI ID to pay from here.`
        }
        onPayWith={payWith}
        onMarkPaid={(paidVia) => settle(paidVia)}
      />

      <div className="dialog-actions dialog-actions-tight">
        <button
          type="button"
          className="button button-ghost button-block"
          onClick={onClose}
          disabled={settling !== null}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
