import { ChevronRight } from "lucide-react";

import { EasterEgg } from "@/components/ui";
import type { Debt } from "@/types";
import { formatRupees } from "@/utils/currency";
import { getInitial } from "@/utils/name";

type DebtListProps = {
  debts: Debt[];
  getName: (userId: string) => string;
  onSelect: (debt: Debt) => void;
};

/** Who owes you and who you owe. Tap a row to settle it. */
export function DebtList({ debts, getName, onSelect }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className="accounts-empty card">
        <EasterEgg slot="accounts-all-square" />
        <p>You're all square with everyone.</p>
      </div>
    );
  }

  // Money owed to you first, then what you owe.
  const sorted = [...debts].sort((a, b) => b.amount - a.amount);

  return (
    <ul className="debt-list card">
      {sorted.map((debt) => {
        const name = getName(debt.otherUserId);
        const owesYou = debt.amount > 0;

        return (
          <li key={debt.id}>
            <button type="button" className="debt-row" onClick={() => onSelect(debt)}>
              <span className="avatar">{getInitial(name)}</span>
              <span className="debt-row-text">
                <span className="debt-row-title">{owesYou ? `${name} owes you` : `You owe ${name}`}</span>
                <span className="debt-row-hint">Tap to settle</span>
              </span>
              <span className={`debt-row-amount ${owesYou ? "is-positive" : "is-negative"}`}>
                {formatRupees(Math.abs(debt.amount))}
              </span>
              <ChevronRight size={18} className="debt-row-chevron" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
