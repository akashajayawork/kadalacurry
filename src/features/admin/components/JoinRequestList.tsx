import { Check } from "lucide-react";
import { useState } from "react";

import type { JoinRequest } from "@/types";

import { CollapsibleSection } from "./CollapsibleSection";
import { JoinRequestRow } from "./JoinRequestRow";

type JoinRequestListProps = {
  requests: JoinRequest[];
};

/** Room admin only: people who signed in to the room and are waiting to be let in. */
export function JoinRequestList({ requests }: JoinRequestListProps) {
  // Approved rows vanish right away, so keep a note of who was let in.
  const [approvedNames, setApprovedNames] = useState<string[]>([]);

  return (
    <CollapsibleSection
      title="Join requests"
      badge={requests.length > 0 && <span className="count-badge">{requests.length}</span>}
      summary={requests.length > 0 ? `${requests.length} waiting to join` : "No one's waiting"}
      // Open straight away when someone's waiting: that's usually why the sheet was opened.
      defaultOpen={requests.length > 0}
    >
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
    </CollapsibleSection>
  );
}
