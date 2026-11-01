import { SuccessMark } from "@/components/feedback";
import { EasterEgg } from "@/components/ui";

type SettleSuccessProps = {
  title: string;
  message: string;
  onDone: () => void;
};

/** The celebration shown inside a dialog once a settlement goes through. */
export function SettleSuccess({ title, message, onDone }: SettleSuccessProps) {
  return (
    <div className="settle-success">
      <SuccessMark />
      <h2 className="dialog-title">{title}</h2>
      <p className="dialog-text">{message}</p>
      <EasterEgg slot="settle-success" />

      <div className="dialog-actions">
        <button type="button" className="button button-primary button-block" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
