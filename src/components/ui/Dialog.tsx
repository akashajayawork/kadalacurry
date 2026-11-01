import { X } from "lucide-react";
import { useEffect, useRef, type PropsWithChildren } from "react";

import "./Dialog.css";

type DialogProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  /** Set to false to block closing, e.g. while a request is in flight. */
  dismissible?: boolean;
  label?: string;
}>;

/**
 * Centered modal popup built on the native <dialog> element (focus trapping,
 * Escape key and top-layer stacking come for free). Children only mount while
 * open, so their state resets every time it opens.
 */
export function Dialog({ open, onClose, dismissible = true, label, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      // The browser can still force-close (e.g. Android back gesture); keep state in sync.
      onClose={() => {
        if (open) onClose();
      }}
      // Clicks on the dimmed backdrop land on the <dialog> itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      {open && (
        <div className="dialog-panel">
          {dismissible && (
            <button type="button" className="dialog-close" onClick={onClose} aria-label="Close">
              <X size={18} strokeWidth={2.2} />
            </button>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
