import { ArrowUpRight, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Dialog } from "@/components/ui";
import { PATHS } from "@/constants/routes";
import { deleteRoom, subscribeToRooms } from "@/services/roomAdminService";
import type { Room } from "@/types";
import { formatShortDate } from "@/utils/date";
import { getInitial } from "@/utils/name";

/** Every room, with a way to delete one. */
export function RoomList() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [deleting, setDeleting] = useState<Room | null>(null);

  useEffect(
    () =>
      subscribeToRooms(setRooms, (error) => {
        console.error("Rooms listener error:", error);
        setFailed(true);
      }),
    []
  );

  return (
    <section className="console-section" aria-labelledby="rooms-title">
      <div className="console-section-header">
        <h2 id="rooms-title" className="section-title">
          Rooms
        </h2>
        {rooms && <span className="console-count">{rooms.length}</span>}
      </div>

      {failed ? (
        <p className="form-error">Couldn't load rooms. Check that the latest firestore.rules are published.</p>
      ) : rooms === null ? (
        <p className="muted-text">Loading…</p>
      ) : rooms.length === 0 ? (
        <p className="console-empty card">No rooms yet.</p>
      ) : (
        <ul className="console-list card">
          {rooms.map((room) => (
            <li key={room.id} className="console-row">
              <div className="console-row-main">
                <span className="avatar">{getInitial(room.name)}</span>
                <span className="console-row-text">
                  <span className="console-row-title">{room.name}</span>
                  <span className="console-row-meta">
                    /{room.id} · {room.adminName || "No admin name"}
                    {room.createdAt && ` · ${formatShortDate(room.createdAt)}`}
                  </span>
                </span>
              </div>
              <div className="console-row-actions">
                <a className="button button-secondary" href={PATHS.room(room.id)}>
                  Open
                  <ArrowUpRight size={16} />
                </a>
                <button type="button" className="button button-secondary is-danger" onClick={() => setDeleting(room)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteRoomDialog room={deleting} onClose={() => setDeleting(null)} />
    </section>
  );
}

function DeleteRoomDialog({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={room !== null} onClose={onClose} dismissible={!busy} label="Delete room">
      {room && <DeleteRoomForm room={room} onBusyChange={setBusy} onClose={onClose} />}
    </Dialog>
  );
}

type DeleteRoomFormProps = {
  room: Room;
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
};

function DeleteRoomForm({ room, onBusyChange, onClose }: DeleteRoomFormProps) {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (typed.trim() !== room.id || deleting) return;

    setDeleting(true);
    setError("");
    onBusyChange(true);

    try {
      await deleteRoom(room.id);
      onBusyChange(false);
      onClose();
    } catch (deleteError) {
      console.error("Deleting the room failed:", deleteError);
      setError("Couldn't delete everything. Try again: it carries on from where it stopped.");
      setDeleting(false);
      onBusyChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="dialog-title">Delete {room.name}?</h2>
      <p className="dialog-text">
        This deletes the room and everything in it for good: roommates, orders, dues, debts and
        payment history. Everyone in it loses access. It can't be undone.
      </p>

      <label className="field console-confirm-field">
        <span className="field-label">
          Type <strong>{room.id}</strong> to confirm
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
        <button
          type="submit"
          className="button button-danger button-block"
          disabled={typed.trim() !== room.id || deleting}
        >
          {deleting ? <LoaderCircle size={18} className="spin" /> : "Delete room"}
        </button>
        <button type="button" className="button button-secondary button-block" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
