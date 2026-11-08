import { useState, type FormEvent } from "react";

import { CoffeeLink } from "@/components/brand";
import { Dialog, Wordmark } from "@/components/ui";
import { PATHS } from "@/constants/routes";

import "./demo.css";

/** Used if the browser closes the dialog without a name (e.g. a forced Escape). */
const GUEST_NAME = "Guest";

type WelcomeDialogProps = {
  open: boolean;
  onStart: (name: string) => void;
};

/** Asks the visitor's name before the demo starts. Can't be dismissed without one. */
export function WelcomeDialog({ open, onStart }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onClose={() => onStart(GUEST_NAME)} dismissible={false} label="Welcome">
      <WelcomeForm onStart={onStart} />
    </Dialog>
  );
}

function WelcomeForm({ onStart }: Pick<WelcomeDialogProps, "onStart">) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmedName) onStart(trimmedName);
  };

  return (
    <form className="demo-welcome" onSubmit={handleSubmit}>
      <Wordmark />
      <h2 className="dialog-title">Try the demo</h2>
      <p className="dialog-text">
        You'll be the admin of a sample room: approve a roommate, set meal prices, order dinner and settle the bill with Google Pay. Nothing you do here is saved; the app's owner just sees the name you enter.
      </p>

      <label className="field">
        <span className="field-label">What should we call you?</span>
        <input
          className="field-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          maxLength={30}
          autoComplete="given-name"
          required
        />
      </label>

      <div className="dialog-actions">
        <button type="submit" className="button button-primary button-block" disabled={!trimmedName}>
          Start demo
        </button>
        <a className="button button-ghost button-block" href={PATHS.create}>
          Skip the demo, make a real room
        </a>
      </div>

      <div className="demo-welcome-coffee">
        <CoffeeLink variant="chip" />
      </div>
    </form>
  );
}
