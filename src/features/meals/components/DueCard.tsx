import { EasterEgg } from "@/components/ui";
import { formatRupees } from "@/utils/currency";

type DueCardProps = {
  /** The user's unpaid meal bill. */
  due: number;
  owedToYou: number;
  youOwe: number;
};

export function DueCard({ due, owedToYou, youOwe }: DueCardProps) {
  return (
    <section className="due-card card" aria-label="Your due">
      <div>
        <p className="eyebrow">Your due</p>
        <p className="due-card-amount">{formatRupees(due)}</p>

        {youOwe > 0 && (
          <p className="due-card-note is-negative">+ {formatRupees(youOwe)} owed to roommates</p>
        )}
        {owedToYou > 0 && (
          <p className="due-card-note is-positive">Roommates owe you {formatRupees(owedToYou)}</p>
        )}
      </div>

      <EasterEgg slot="home-due" />
    </section>
  );
}
