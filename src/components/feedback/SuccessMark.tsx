import { ConfettiBurst } from "./ConfettiBurst";
import "./SuccessMark.css";

/** Animated check mark with a confetti burst, for completed money actions. */
export function SuccessMark() {
  return (
    <span className="success-mark" aria-hidden="true">
      <svg viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" />
        <path d="M15 27l7 7 15-15" />
      </svg>
      <ConfettiBurst pieces={18} spread={72} />
    </span>
  );
}
