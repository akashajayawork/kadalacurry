import { Copy, LoaderCircle } from "lucide-react";

import { useToast } from "@/components/feedback";
import { canOpenUpiApps } from "@/services/paymentService";
import type { PaymentMethod } from "@/types";
import { formatRupees } from "@/utils/currency";
import { formatPhone, type UpiApp, type UpiTarget } from "@/utils/upi";

type PaymentOptionsProps = {
  /** The room's vendor UPI, or null if it isn't set. */
  target: UpiTarget | null;
  total: number;
  /** The method being recorded right now, if any. */
  settling: PaymentMethod | null;
  /** Shown when no vendor UPI is set. */
  missingHint: string;
  onPayWith: (app: UpiApp) => void;
  onMarkPaid: (paidVia: PaymentMethod) => void;
};

/** How the payer pays the vendor: Google Pay, another UPI app, or any other way. */
export function PaymentOptions({
  target,
  total,
  settling,
  missingHint,
  onPayWith,
  onMarkPaid,
}: PaymentOptionsProps) {
  const { showToast } = useToast();
  const busy = settling !== null;

  const markPaidButton = (paidVia: PaymentMethod, label: string, primary = false) => (
    <button
      type="button"
      className={`button button-block ${primary ? "button-primary" : "button-secondary"}`}
      onClick={() => onMarkPaid(paidVia)}
      disabled={busy || total <= 0}
    >
      {settling === paidVia ? <LoaderCircle size={18} className="spin" /> : label}
    </button>
  );

  if (target?.kind === "upi-id" && canOpenUpiApps()) {
    return (
      <div className="pay-options">
        <p className="pay-label">Pay the vendor</p>
        <button
          type="button"
          className="button button-primary button-block"
          onClick={() => onPayWith("gpay")}
          disabled={busy || total <= 0}
        >
          Pay {formatRupees(total)} with Google Pay
        </button>
        <button
          type="button"
          className="button button-secondary button-block"
          onClick={() => onPayWith("upi")}
          disabled={busy || total <= 0}
        >
          Other UPI app
        </button>
        {markPaidButton("other", "Paid another way")}
        <p className="pay-hint">Paid in cash or some other way? That settles it straight away.</p>
      </div>
    );
  }

  if (target?.kind === "upi-id") {
    return (
      <div className="pay-options">
        <p className="pay-hint">
          Google Pay opens on your phone. On a computer, pay <strong>{target.upiId}</strong> from
          your phone, then mark it paid here.
        </p>
        {markPaidButton("upi", `I've paid ${formatRupees(total)}`, true)}
        {markPaidButton("other", "Paid another way")}
      </div>
    );
  }

  if (target?.kind === "phone") {
    const copyNumber = async () => {
      try {
        await navigator.clipboard.writeText(target.phone);
        showToast("Number copied", "success");
      } catch {
        showToast("Couldn't copy. Long-press the number instead.", "error");
      }
    };

    return (
      <div className="pay-options">
        <div className="pay-number">
          <span>
            <span className="pay-label">Vendor's UPI number</span>
            <strong>{formatPhone(target.phone)}</strong>
          </span>
          <button type="button" className="pill-button" onClick={copyNumber}>
            <Copy size={15} />
            Copy
          </button>
        </div>
        <p className="pay-hint">Pay {formatRupees(total)} to this number in any UPI app, then come back.</p>
        {markPaidButton("upi", `I've paid ${formatRupees(total)}`, true)}
        {markPaidButton("other", "Paid another way")}
      </div>
    );
  }

  return (
    <div className="pay-options">
      <p className="pay-hint">{missingHint}</p>
      {markPaidButton("other", `Mark ${formatRupees(total)} as paid`, true)}
    </div>
  );
}
