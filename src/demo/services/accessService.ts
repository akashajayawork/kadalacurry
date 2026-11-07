// Demo stand-in for src/services/accessService.ts (same functions, in memory).
import type { AccessRequest } from "@/types";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

/** Nobody new signs in to the demo, so there's nothing to send. */
export async function requestAccess(): Promise<void> {}

export function subscribeToAccessRequests(onChange: (requests: AccessRequest[]) => void) {
  return watchDemoState((state) =>
    onChange(
      Object.values(state.accessRequests).sort(
        (a, b) => (a.requestedAt?.getTime() ?? 0) - (b.requestedAt?.getTime() ?? 0)
      )
    )
  );
}

/** Lets them in under the chosen name. An existing account is never overwritten. */
export async function approveAccessRequest(uid: string, name: string, email: string | null): Promise<void> {
  await simulateLatency(500);

  updateDemoState((state) => {
    state.people[uid] ??= { name, email, outstandingBalance: 0 };
    delete state.accessRequests[uid];
  });
}

export async function declineAccessRequest(uid: string): Promise<void> {
  await simulateLatency();

  updateDemoState((state) => {
    delete state.accessRequests[uid];
  });
}
