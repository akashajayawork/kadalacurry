import { HandCoins } from "lucide-react";

import { EasterEgg } from "@/components/ui";
import type { Roommate } from "@/types";
import { formatRupees } from "@/utils/currency";
import { getInitial } from "@/utils/name";

type TotalDueCardProps = {
  roommates: Roommate[];
  currentUserId: string;
  loading: boolean;
  onSettle: () => void;
};

/** The household's unpaid meal bill, who it's for, and the button to pay it all. */
export function TotalDueCard({ roommates, currentUserId, loading, onSettle }: TotalDueCardProps) {
  const total = roommates.reduce((sum, roommate) => sum + roommate.outstandingBalance, 0);
  const withDue = roommates
    .filter((roommate) => roommate.outstandingBalance !== 0)
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance);

  return (
    <section className="total-due card" aria-label="Total due">
      <div className="total-due-top">
        <div>
          <p className="eyebrow">Total due</p>
          <p className="total-due-amount">{loading ? "–" : formatRupees(total)}</p>
          <p className="total-due-caption">
            {loading
              ? "Loading balances…"
              : total > 0
                ? "Unpaid meal bill for the house"
                : "All clear. Nothing to pay."}
          </p>
        </div>
        <EasterEgg slot="accounts-total" />
      </div>

      {withDue.length > 0 && (
        <ul className="due-breakdown">
          {withDue.map((roommate) => (
            <li key={roommate.id}>
              <span className="avatar">{getInitial(roommate.name)}</span>
              <span className="due-breakdown-name">
                {roommate.id === currentUserId ? "You" : roommate.name}
              </span>
              <span className="due-breakdown-amount">{formatRupees(roommate.outstandingBalance)}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="button button-primary button-block"
        onClick={onSettle}
        disabled={loading || total <= 0}
      >
        <HandCoins size={19} />
        {total > 0 ? `Settle ${formatRupees(total)}` : "Nothing to settle"}
      </button>
    </section>
  );
}
