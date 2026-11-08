import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

import { ConfettiBurst } from "@/components/feedback";
import { tapFeedback } from "@/utils/haptics";

/** How long the celebration plays before the page changes. */
const CELEBRATION_MS = 650;

type ChoiceTileProps = {
  href: string;
  icon: LucideIcon;
  /** An image to show instead of the icon (an easter egg). */
  art?: string;
  title: string;
  caption: string;
  tone: "warm" | "dark";
};

/** A big square choice on the home page. Tapping it celebrates, then goes. */
export function ChoiceTile({ href, icon: Icon, art, title, caption, tone }: ChoiceTileProps) {
  const [celebrating, setCelebrating] = useState(false);

  // Coming back with the browser's Back button restores the page as it was
  // left, mid-celebration; start fresh so the tile works again.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setCelebrating(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Opening in a new tab works as a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (celebrating) return;

    tapFeedback([10, 40, 14]);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCelebrating(!reduceMotion);
    window.setTimeout(() => window.location.assign(href), reduceMotion ? 0 : CELEBRATION_MS);
  };

  return (
    <a
      href={href}
      className={`choice choice-${tone} ${celebrating ? "is-celebrating" : ""}`}
      onClick={handleClick}
    >
      {/* Floods the tile from the icon outwards, turning it dark. */}
      {celebrating && <span className="choice-fill" aria-hidden="true" />}
      <span className={`choice-icon ${art ? "has-art" : ""}`}>
        {art ? (
          <img className="choice-art" src={art} alt="" draggable={false} />
        ) : (
          <Icon size={26} strokeWidth={2.2} />
        )}
        {celebrating && (
          <>
            <span className="choice-ring" aria-hidden="true" />
            <ConfettiBurst pieces={16} spread={64} />
          </>
        )}
      </span>
      <span className="choice-title">{title}</span>
      <span className="choice-caption">{caption}</span>
    </a>
  );
}
