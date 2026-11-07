import { useState } from "react";

import { Wordmark } from "@/components/ui";

import { AboutDialog } from "./AboutDialog";
import "./brand.css";

/** The kadalacurry logo. Tapping it opens About (with Buy me a coffee). */
export function BrandButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`brand-button ${className}`}
        onClick={() => setOpen(true)}
        aria-label="About kadalacurry"
      >
        <Wordmark />
      </button>
      <AboutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
