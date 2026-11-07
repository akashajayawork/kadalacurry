import { RotateCcw } from "lucide-react";

import "./demo.css";

type DemoBannerProps = {
  onRestart: () => void;
};

export function DemoBanner({ onRestart }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="note">
      <p className="demo-banner-text">
        <strong>Demo</strong> · You're the admin. Nothing is saved.
      </p>
      <button type="button" className="demo-banner-restart" onClick={onRestart}>
        <RotateCcw size={14} strokeWidth={2.4} />
        Start over
      </button>
    </div>
  );
}
