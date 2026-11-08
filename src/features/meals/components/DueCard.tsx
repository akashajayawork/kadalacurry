import { EasterEgg } from "@/components/ui";
import { formatRupees } from "@/utils/currency";

type DueCardProps = {
  /** The user's unpaid meal bill. */
  due: number;
  owedToYou: number;
  youOwe: number;
  /** Goes up by one each time an order is saved: the coins blink. */
  celebrate?: number;
};

export function DueCard({ due, owedToYou, youOwe, celebrate = 0 }: DueCardProps) {
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

      {/* A new key replays the blink each time. */}
      <span key={celebrate} className={`due-card-coin ${celebrate > 0 ? "is-blinking" : ""}`}>
        <EasterEgg slot="home-due" />
      </span>
    </section>
  );
}
