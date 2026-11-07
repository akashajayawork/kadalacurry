import { ArrowLeftRight, Download, LoaderCircle, Receipt } from "lucide-react";

import type { Settlement } from "@/types";
import { formatRupees } from "@/utils/currency";
import { formatShortDate, formatTime } from "@/utils/date";

import { usePaymentHistoryDownload } from "../hooks/usePaymentHistoryDownload";
import { describeSettlement, PAID_VIA_LABELS } from "../utils/settlements";

type PaymentHistoryProps = {
  settlements: Settlement[];
  loading: boolean;
  currentUserId: string;
};

export function PaymentHistory({ settlements, loading, currentUserId }: PaymentHistoryProps) {
  const { download, downloading } = usePaymentHistoryDownload();

  return (
    <section className="accounts-section" aria-labelledby="history-title">
      <div className="accounts-section-header">
        <h2 id="history-title" className="section-title">
          Payment history
        </h2>
        <button
          type="button"
          className="pill-button"
          onClick={download}
          disabled={downloading || settlements.length === 0}
        >
          {downloading ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}
          PDF
        </button>
      </div>

      {loading ? (
        <p className="muted-text">Loading…</p>
      ) : settlements.length === 0 ? (
        <div className="accounts-empty card">
          <p>No settlements yet. They'll show up here.</p>
        </div>
      ) : (
        <ul className="history-list card">
          {settlements.map((settlement) => {
            const Icon = settlement.kind === "bill" ? Receipt : ArrowLeftRight;

            return (
              <li key={settlement.id} className="history-row">
                <span className="history-icon">
                  <Icon size={18} />
                </span>
                <span className="history-text">
                  <span className="history-title">{describeSettlement(settlement, currentUserId)}</span>
                  {settlement.createdAt && (
                    <span className="history-meta">
                      {formatShortDate(settlement.createdAt)} · {formatTime(settlement.createdAt)}
                      {settlement.kind === "bill" && settlement.paidVia && ` · ${PAID_VIA_LABELS[settlement.paidVia]}`}
                    </span>
                  )}
                </span>
                <span className="history-amount">{formatRupees(settlement.amount)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
