import { RotateCcw } from "lucide-react";

import { CoffeeLink } from "@/components/brand";
import { PATHS } from "@/constants/routes";

import "./demo.css";

type DemoBannerProps = {
  onRestart: () => void;
};

export function DemoBanner({ onRestart }: DemoBannerProps) {
  return (
    <div className="demo-banner" role="note">
      <p className="demo-banner-text">
        <strong>Demo</strong> · You're the room admin. Nothing is saved.
      </p>
      <div className="demo-banner-actions">
        <a className="demo-banner-button" href={PATHS.create}>
          Make a room
        </a>
        <button type="button" className="demo-banner-button" onClick={onRestart} aria-label="Start over">
          <RotateCcw size={14} strokeWidth={2.4} />
        </button>
      </div>
      <div className="demo-banner-coffee">
        <CoffeeLink variant="chip" />
      </div>
    </div>
  );
}
