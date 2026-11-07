import { Check } from "lucide-react";
import { useState } from "react";

import type { JoinRequest } from "@/types";

import { JoinRequestRow } from "./JoinRequestRow";

type JoinRequestListProps = {
  requests: JoinRequest[];
};

/** Room admin only: people who signed in to the room and are waiting to be let in. */
export function JoinRequestList({ requests }: JoinRequestListProps) {
  // Approved rows vanish right away, so keep a note of who was let in.
  const [approvedNames, setApprovedNames] = useState<string[]>([]);

  return (
    <section className="setup-section" aria-labelledby="join-requests-title">
      <div className="setup-section-header">
        <h3 id="join-requests-title" className="setup-section-title">
          Join requests
        </h3>
        {requests.length > 0 && <span className="count-badge">{requests.length}</span>}
      </div>

      {approvedNames.map((name, index) => (
        <p key={`${name}-${index}`} className="access-approved">
          <Check size={16} strokeWidth={2.6} />
          {name} is in
        </p>
      ))}

      {requests.length === 0 ? (
        <p className="setup-empty">
          No one's waiting. Send your roommates the room link: when they sign in, they'll show up here.
        </p>
      ) : (
        <ul className="access-request-list">
          {requests.map((request) => (
            <li key={request.uid}>
              <JoinRequestRow
                request={request}
                onApproved={(name) => setApprovedNames((current) => [...current, name])}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
