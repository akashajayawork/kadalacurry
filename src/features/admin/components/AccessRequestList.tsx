import { Check } from "lucide-react";
import { useState } from "react";

import type { AccessRequest } from "@/types";

import { AccessRequestRow } from "./AccessRequestRow";
import "../admin.css";

type AccessRequestListProps = {
  requests: AccessRequest[];
};

/** Admin only: people who signed in with Google and are waiting to be let in. */
export function AccessRequestList({ requests }: AccessRequestListProps) {
  // Approved rows vanish right away, so keep a note of who was let in.
  const [approvedNames, setApprovedNames] = useState<string[]>([]);

  return (
    <section className="access-requests" aria-labelledby="access-requests-title">
      <div className="access-requests-header">
        <h3 id="access-requests-title" className="access-requests-title">
          Access requests
        </h3>
        {requests.length > 0 && <span className="count-badge">{requests.length}</span>}
      </div>

      {approvedNames.map((name, index) => (
        <p key={`${name}-${index}`} className="access-approved">
          <Check size={16} strokeWidth={2.6} />
          {name} can now use the app
        </p>
      ))}

      {requests.length === 0 ? (
        <p className="access-requests-empty">
          No one's waiting. When a friend signs in with Google, they'll show up here.
        </p>
      ) : (
        <ul className="access-request-list">
          {requests.map((request) => (
            <li key={request.uid}>
              <AccessRequestRow
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
