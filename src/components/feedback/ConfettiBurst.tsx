import type { CSSProperties } from "react";

import "./ConfettiBurst.css";

const COLORS = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#007aff", "#af52de"];

type ConfettiBurstProps = {
  pieces?: number;
  /** How far the pieces fly, in px. */
  spread?: number;
};

/** A one-shot confetti burst from the centre of its parent. Change its key to replay. */
export function ConfettiBurst({ pieces = 14, spread = 56 }: ConfettiBurstProps) {
  return (
    <span className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={
            {
              "--angle": `${(360 / pieces) * index}deg`,
              "--distance": `${spread * (0.7 + (index % 3) * 0.15)}px`,
              "--color": COLORS[index % COLORS.length],
              "--delay": `${(index % 4) * 18}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
