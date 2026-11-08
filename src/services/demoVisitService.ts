// Who has tried the demo (names from its welcome popup). Main admin only.
// The demo itself writes these without the SDK: see src/demo/visitLog.ts.
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import type { DemoVisit } from "@/types";

/** How many of the latest visits the admin page shows. */
const SHOWN = 100;

export function subscribeToDemoVisits(
  onChange: (visits: DemoVisit[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.demoVisits), orderBy("visitedAt", "desc"), limit(SHOWN)),
    (snapshot) => {
      onChange(
        snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            name: typeof data.name === "string" ? data.name : "Someone",
            visitedAt: data.visitedAt instanceof Timestamp ? data.visitedAt.toDate() : null,
          };
        })
      );
    },
    onError
  );
}
