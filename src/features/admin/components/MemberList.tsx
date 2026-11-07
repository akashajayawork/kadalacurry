import { LoaderCircle, UserMinus } from "lucide-react";
import { useState } from "react";

import { useCurrentUser, useRoom, useRoommates } from "@/features/rooms";
import { MemberHasDueError, removeMember } from "@/services/memberService";
import type { Roommate } from "@/types";
import { formatRupees } from "@/utils/currency";
import { getInitial } from "@/utils/name";

/**
 * Room admin: everyone in the room, with a way to remove people. New people
 * can only join by signing in to the room link and being approved.
 */
export function MemberList() {
  const { roomId, room } = useRoom();
  const user = useCurrentUser();
  const { roommates, loading } = useRoommates();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // The admin first, then everyone else by name.
  const sorted = [...roommates].sort((a, b) =>
    a.id === room.adminUid ? -1 : b.id === room.adminUid ? 1 : a.name.localeCompare(b.name)
  );

  const handleRemove = async (member: Roommate) => {
    setRemovingId(member.id);
    setError("");

    try {
      await removeMember(roomId, member.id);
      setConfirmingId(null);
    } catch (removeError) {
      console.error("Removing a member failed:", removeError);
      setError(
        removeError instanceof MemberHasDueError
          ? `${member.name} has a due again. Settle it first.`
          : "Couldn't remove them right now. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="setup-section" aria-labelledby="members-title">
      <div className="setup-section-header">
        <h3 id="members-title" className="setup-section-title">
          Roommates
        </h3>
        {!loading && <span className="setup-count">{roommates.length}</span>}
      </div>

      {error && <p className="form-error">{error}</p>}

      <ul className="member-list">
        {sorted.map((member) => {
          const isAdmin = member.id === room.adminUid;
          const hasDue = member.outstandingBalance !== 0;

          return (
            <li key={member.id} className="member-row">
              <div className="member-row-main">
                <span className="avatar">{getInitial(member.name)}</span>
                <span className="member-row-text">
                  <span className="member-row-name">
                    {member.name}
                    {member.id === user.uid && <span className="member-tag">You</span>}
                  </span>
                  <span className="member-row-meta">
                    {isAdmin ? "Room admin" : hasDue ? `${formatRupees(member.outstandingBalance)} due` : "No due"}
                  </span>
                </span>

                {!isAdmin && confirmingId !== member.id && (
                  <button
                    type="button"
                    className="pill-button"
                    onClick={() => setConfirmingId(member.id)}
                    disabled={hasDue || removingId !== null}
                    aria-label={`Remove ${member.name}`}
                  >
                    <UserMinus size={15} />
                    Remove
                  </button>
                )}
              </div>

              {!isAdmin && hasDue && (
                <p className="member-row-note">Settle the total due before removing {member.name}.</p>
              )}

              {confirmingId === member.id && (
                <div className="member-confirm">
                  <p>
                    Remove {member.name}? They lose access straight away. Their past orders and
                    payments stay.
                  </p>
                  <div className="member-confirm-actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setConfirmingId(null)}
                      disabled={removingId !== null}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleRemove(member)}
                      disabled={removingId !== null}
                    >
                      {removingId === member.id ? <LoaderCircle size={18} className="spin" /> : "Remove"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="setup-hint">
        To add someone, send them the room link. They sign in with Google and show up under Join
        requests.
      </p>
    </section>
  );
}
