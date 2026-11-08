import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Dialog } from "@/components/ui";
import { PATHS } from "@/constants/routes";
import { useAccount } from "@/features/auth";
import { RoomNameField, useRoomNameCheck } from "@/features/create-room";
import { deleteV1House, hasV1House, moveV1House, type MoveSummary } from "@/services/migrationService";
import { RoomNameTakenError } from "@/services/roomAdminService";

type MoveState =
  | { kind: "idle" }
  | { kind: "moving"; done: number; total: number }
  | { kind: "moved"; summary: MoveSummary; name: string };

/**
 * Only while the original single-house data (v1) is still in the database:
 * copies it into a new room, then lets the main admin delete the old copy.
 */
export function MoveHouseCard() {
  const account = useAccount();
  const [hasHouse, setHasHouse] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState<MoveState>({ kind: "idle" });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameCheck = useRoomNameCheck(name);

  useEffect(() => {
    hasV1House()
      .then(setHasHouse)
      .catch((checkError) => {
        // Rules without the v1 section, or nothing to read: nothing to move.
        console.error("Checking for the v1 house failed:", checkError);
        setHasHouse(false);
      });
  }, []);

  if (!hasHouse) return null;

  const handleMove = async (event: FormEvent) => {
    event.preventDefault();
    if (!nameCheck.isAvailable || state.kind === "moving") return;

    setError("");
    setState({ kind: "moving", done: 0, total: 0 });

    try {
      const summary = await moveV1House(
        account,
        { roomId: nameCheck.roomId, name: name.trim() },
        (done, total) => setState({ kind: "moving", done, total })
      );
      setState({ kind: "moved", summary, name: name.trim() });
    } catch (moveError) {
      console.error("Moving the v1 house failed:", moveError);
      setState({ kind: "idle" });
      setError(
        moveError instanceof RoomNameTakenError
          ? "That name was just taken. Try another."
          : "The move stopped partway. Delete the new room from the list above, then try again. The original data is untouched."
      );
    }
  };

  return (
    <section className="console-section" aria-labelledby="move-title">
      <h2 id="move-title" className="section-title">
        Original house
      </h2>

      <div className="card console-card">
        {state.kind === "moved" ? (
          <>
            <p className="console-success">
              <Check size={18} strokeWidth={2.6} />
              Moved into {state.name}
            </p>
            <p className="muted-text">
              {state.summary.members} roommates, {state.summary.orders} orders, {state.summary.debts}{" "}
              debts, {state.summary.settlements} payments and {state.summary.requests} waiting
              requests. Everyone signs in at the new link with the same Google account. Send the
              vendor the new vendor link from room setup.
            </p>
            <a className="button button-primary button-block" href={PATHS.room(state.summary.roomId)}>
              Open {state.name}
              <ArrowUpRight size={17} />
            </a>
          </>
        ) : (
          <form className="console-form" onSubmit={handleMove}>
            <p className="muted-text">
              The roommates, dues, orders and payment history from before rooms existed are still
              here. Move them into a room with you as its admin. Nothing is lost: the old copy stays
              until you delete it below.
            </p>

            <RoomNameField
              value={name}
              onChange={setName}
              check={nameCheck}
              disabled={state.kind === "moving"}
            />

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="button button-primary button-block"
              disabled={!nameCheck.isAvailable || state.kind === "moving"}
            >
              {state.kind === "moving" ? (
                <>
                  <LoaderCircle size={18} className="spin" />
                  {state.total > 0 ? `Copying ${state.done} of ${state.total}…` : "Starting…"}
                </>
              ) : (
                "Move into a new room"
              )}
            </button>
          </form>
        )}

        <button
          type="button"
          className="button button-ghost button-block"
          onClick={() => setConfirmDelete(true)}
          disabled={state.kind === "moving"}
        >
          Delete the old copy
        </button>
      </div>

      <DeleteOldCopyDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => setHasHouse(false)}
      />
    </section>
  );
}

type DeleteOldCopyDialogProps = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

function DeleteOldCopyDialog({ open, onClose, onDeleted }: DeleteOldCopyDialogProps) {
  const [deleting, setDeleting] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} dismissible={!deleting} label="Delete the old copy">
      <DeleteOldCopyForm onBusyChange={setDeleting} onClose={onClose} onDeleted={onDeleted} />
    </Dialog>
  );
}

type DeleteOldCopyFormProps = Omit<DeleteOldCopyDialogProps, "open"> & {
  onBusyChange: (busy: boolean) => void;
};

/** There's no undo, so it asks for the word "delete" first. */
function DeleteOldCopyForm({ onBusyChange, onClose, onDeleted }: DeleteOldCopyFormProps) {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const confirmed = typed.trim().toLowerCase() === "delete";

  const handleDelete = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmed || deleting) return;

    setDeleting(true);
    onBusyChange(true);
    setError("");

    try {
      await deleteV1House();
      onBusyChange(false);
      onDeleted();
      onClose();
    } catch (deleteError) {
      console.error("Deleting the v1 house failed:", deleteError);
      setError("Couldn't delete everything. Try again: it carries on from where it stopped.");
      setDeleting(false);
      onBusyChange(false);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <h2 className="dialog-title">Delete the old copy?</h2>
      <p className="dialog-text">
        Only do this once you've moved the house into a room and checked it. It deletes the
        original users, roommates, orders, debts, payments and requests for good.
      </p>

      <label className="field console-confirm-field">
        <span className="field-label">
          Type <strong>delete</strong> to confirm
        </span>
        <input
          className="field-input"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={deleting}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="dialog-actions">
        <button type="submit" className="button button-danger button-block" disabled={!confirmed || deleting}>
          {deleting ? <LoaderCircle size={18} className="spin" /> : "Delete the old copy"}
        </button>
        <button type="button" className="button button-secondary button-block" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
