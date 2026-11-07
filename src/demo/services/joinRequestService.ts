// Demo stand-in for src/services/joinRequestService.ts (same functions, in memory).
import type { JoinRequest } from "@/types";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

/** The visitor is already in the room, so there's never anything to send. */
export async function requestToJoin(): Promise<void> {}

export function subscribeToJoinRequests(_roomId: string, onChange: (requests: JoinRequest[]) => void) {
  return watchDemoState((state) =>
    onChange(
      Object.values(state.joinRequests).sort(
        (a, b) => (a.requestedAt?.getTime() ?? 0) - (b.requestedAt?.getTime() ?? 0)
      )
    )
  );
}

/** Lets them in under the chosen name. Someone already in is never overwritten. */
export async function approveJoinRequest(
  _roomId: string,
  uid: string,
  name: string,
  email: string | null
): Promise<void> {
  await simulateLatency(500);

  updateDemoState((state) => {
    state.members[uid] ??= { name, email, outstandingBalance: 0 };
    delete state.joinRequests[uid];
  });
}

export async function declineJoinRequest(_roomId: string, uid: string): Promise<void> {
  await simulateLatency();

  updateDemoState((state) => {
    delete state.joinRequests[uid];
  });
}
