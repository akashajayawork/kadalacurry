import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  approveRoomRequest,
  declineRoomRequest,
  subscribeToRoomRequests,
} from "@/services/roomRequestService";
import type { RoomRequest } from "@/types";
import { formatShortDate } from "@/utils/date";
import { getInitial } from "@/utils/name";

/** People who signed in at /create and want a room. */
export function RoomRequestList() {
  const [requests, setRequests] = useState<RoomRequest[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(
    () =>
      subscribeToRoomRequests(setRequests, (error) => {
        console.error("Room requests listener error:", error);
        setFailed(true);
      }),
    []
  );

  const pending = requests?.filter((request) => request.status === "pending") ?? [];

  return (
    <section className="console-section" aria-labelledby="room-requests-title">
      <div className="console-section-header">
        <h2 id="room-requests-title" className="section-title">
          Room requests
        </h2>
        {pending.length > 0 && <span className="count-badge">{pending.length}</span>}
      </div>

      {failed ? (
        <p className="form-error">Couldn't load requests. Check that the latest firestore.rules are published.</p>
      ) : requests === null ? (
        <p className="muted-text">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="console-empty card">
          No one's asking. People request a room by signing in at /create.
        </p>
      ) : (
        <ul className="console-list card">
          {requests.map((request) => (
            <RoomRequestRow key={request.uid} request={request} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RoomRequestRow({ request }: { request: RoomRequest }) {
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState("");
  const isApproved = request.status === "approved";

  const run = async (action: "approve" | "decline") => {
    setBusy(action);
    setError("");

    try {
      await (action === "approve" ? approveRoomRequest(request.uid) : declineRoomRequest(request.uid));
    } catch (actionError) {
      console.error(`Couldn't ${action} the room request:`, actionError);
      setError("That didn't work. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="console-row">
      <div className="console-row-main">
        {request.photoURL ? (
          <img className="console-photo" src={request.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar">{getInitial(request.name ?? request.email)}</span>
        )}
        <span className="console-row-text">
          <span className="console-row-title">{request.name ?? "Google user"}</span>
          <span className="console-row-meta">
            {request.email}
            {request.requestedAt && ` · ${formatShortDate(request.requestedAt)}`}
          </span>
          {isApproved && (
            <span className="console-row-status">Approved · they can name their room at /create</span>
          )}
        </span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="console-row-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => run("decline")}
          disabled={busy !== null}
        >
          {busy === "decline" ? <LoaderCircle size={18} className="spin" /> : isApproved ? "Revoke" : "Decline"}
        </button>
        {!isApproved && (
          <button
            type="button"
            className="button button-primary"
            onClick={() => run("approve")}
            disabled={busy !== null}
          >
            {busy === "approve" ? <LoaderCircle size={18} className="spin" /> : "Approve"}
          </button>
        )}
      </div>
    </li>
  );
}
