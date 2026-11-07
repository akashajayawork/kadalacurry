import { ArrowUpRight } from "lucide-react";

import { Dialog, Wordmark } from "@/components/ui";
import { PATHS } from "@/constants/routes";
import { CREATOR_NAME } from "@/config/support";

import { CoffeeLink } from "./CoffeeLink";

type AboutDialogProps = {
  open: boolean;
  onClose: () => void;
};

const IS_DEMO = import.meta.env.MODE === "demo";

/** Opens from the kadalacurry logo. */
export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} label="About kadalacurry">
      <div className="about">
        <Wordmark className="about-wordmark" />
        <p className="dialog-text">
          Order meals, split the bill and stay square with your roommates. Made by {CREATOR_NAME}.
        </p>
        <p className="about-version">Version {__APP_VERSION__}</p>

        <div className="dialog-actions">
          <CoffeeLink />
          <a className="button button-secondary button-block" href={PATHS.create}>
            Make a room for your house
            <ArrowUpRight size={17} />
          </a>
          {!IS_DEMO && (
            <a className="about-link" href={PATHS.demo}>
              Try the demo
            </a>
          )}
        </div>
      </div>
    </Dialog>
  );
}
