// Demo stand-in for src/services/memberService.ts (same functions, in memory).
import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import type { Roommate } from "@/types";

import { simulateLatency, updateDemoState, watchDemoState } from "../store";

export class MemberHasDueError extends Error {
  constructor() {
    super("Their due has to be settled before they can be removed.");
    this.name = "MemberHasDueError";
  }
}

export function toRoommate(id: string, data: { name?: unknown; outstandingBalance?: unknown }): Roommate {
  return {
    id,
    name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_ROOMMATE_NAME,
    outstandingBalance: typeof data.outstandingBalance === "number" ? data.outstandingBalance : 0,
  };
}

export function subscribeToRoommates(_roomId: string, onChange: (roommates: Roommate[]) => void) {
  return watchDemoState((state) =>
    onChange(Object.entries(state.members).map(([id, member]) => toRoommate(id, member)))
  );
}

export function subscribeToMembership(
  _roomId: string,
  uid: string,
  onChange: (member: Roommate | null) => void
) {
  return watchDemoState((state) => {
    const member = state.members[uid];
    onChange(member ? toRoommate(uid, member) : null);
  });
}

export function subscribeToMemberBalance(
  _roomId: string,
  uid: string,
  onChange: (balance: number) => void
) {
  return watchDemoState((state) => onChange(state.members[uid]?.outstandingBalance ?? 0));
}

export async function removeMember(_roomId: string, uid: string): Promise<void> {
  await simulateLatency(500);

  updateDemoState((state) => {
    const member = state.members[uid];
    if (!member) return;
    if (member.outstandingBalance !== 0) throw new MemberHasDueError();
    delete state.members[uid];
  });
}
