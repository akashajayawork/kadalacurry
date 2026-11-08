import { useEffect, useState } from "react";

import { subscribeToDemoVisits } from "@/services/demoVisitService";
import type { DemoVisit } from "@/types";
import { formatShortDate, formatTime } from "@/utils/date";
import { getInitial } from "@/utils/name";

/** Names people typed into the demo, newest first. */
export function DemoVisitorList() {
  const [visits, setVisits] = useState<DemoVisit[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(
    () =>
      subscribeToDemoVisits(setVisits, (error) => {
        console.error("Demo visits listener error:", error);
        setFailed(true);
      }),
    []
  );

  return (
    <section className="console-section" aria-labelledby="demo-visitors-title">
      <div className="console-section-header">
        <h2 id="demo-visitors-title" className="section-title">
          Demo visitors
        </h2>
        {visits && visits.length > 0 && <span className="console-count">{visits.length}</span>}
      </div>

      {failed ? (
        <p className="form-error">Couldn't load demo visitors. Check that the latest firestore.rules are published.</p>
      ) : visits === null ? (
        <p className="muted-text">Loading…</p>
      ) : visits.length === 0 ? (
        <p className="console-empty card">No one has tried the demo yet.</p>
      ) : (
        <ul className="console-list card">
          {visits.map((visit) => (
            <li key={visit.id} className="console-row console-row-compact">
              <div className="console-row-main">
                <span className="avatar">{getInitial(visit.name)}</span>
                <span className="console-row-text">
                  <span className="console-row-title">{visit.name}</span>
                  {visit.visitedAt && (
                    <span className="console-row-meta">
                      {formatShortDate(visit.visitedAt)} · {formatTime(visit.visitedAt)}
                    </span>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
