import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import { approveAccessRequest, declineAccessRequest } from "@/services/accessService";
import type { AccessRequest } from "@/types";
import { tapFeedback } from "@/utils/haptics";
import { getInitial } from "@/utils/name";

type AccessRequestRowProps = {
  request: AccessRequest;
  onApproved: (name: string) => void;
};

export function AccessRequestRow({ request, onApproved }: AccessRequestRowProps) {
  const [name, setName] = useState(request.name ?? "");
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState("");
  const trimmedName = name.trim();

  const handleApprove = async (event: FormEvent) => {
    event.preventDefault();
    if (!trimmedName || busy) return;

    setBusy("approve");
    setError("");

    try {
      await approveAccessRequest(request.uid, trimmedName, request.email);
      tapFeedback([10, 40, 14]);
      // The row disappears on its own once the request is removed.
      onApproved(trimmedName);
    } catch (approveError) {
      console.error("Approving access failed:", approveError);
      setError("Couldn't approve right now. Please try again.");
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    if (busy) return;

    setBusy("decline");
    setError("");

    try {
      await declineAccessRequest(request.uid);
    } catch (declineError) {
      console.error("Declining access failed:", declineError);
      setError("Couldn't decline right now. Please try again.");
      setBusy(null);
    }
  };

  return (
    <form className="access-request" onSubmit={handleApprove}>
      <div className="access-request-person">
        {request.photoURL ? (
          <img
            className="access-request-photo"
            src={request.photoURL}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="avatar">{getInitial(request.name ?? request.email)}</span>
        )}
        <span className="access-request-text">
          <span className="access-request-google-name">{request.name ?? "Google user"}</span>
          {request.email && <span className="access-request-email">{request.email}</span>}
        </span>
      </div>

      <label className="field">
        <span className="field-label">Name in the house</span>
        <input
          className="field-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Rahul"
          maxLength={40}
          autoComplete="off"
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="access-request-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={handleDecline}
          disabled={busy !== null}
        >
          {busy === "decline" ? <LoaderCircle size={18} className="spin" /> : "Decline"}
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={busy !== null || !trimmedName}
        >
          {busy === "approve" ? <LoaderCircle size={18} className="spin" /> : "Approve"}
        </button>
      </div>
    </form>
  );
}
