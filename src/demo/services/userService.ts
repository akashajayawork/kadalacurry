// Demo stand-in for src/services/userService.ts (same functions, in memory).
import type { GoogleAccount } from "@/types";

import { getDemoState, watchDemoState } from "../store";

type ApprovalResult =
  | { approved: false }
  | { approved: true; isAdmin: boolean; name: string | null };

export async function checkApprovalAndSyncProfile(account: GoogleAccount): Promise<ApprovalResult> {
  const person = getDemoState().people[account.uid];
  return person
    ? { approved: true, isAdmin: person.role === "admin", name: person.name }
    : { approved: false };
}

/** The demo visitor is already approved, so there's nothing to wait for. */
export function subscribeToApproval() {
  return () => {};
}

export function subscribeToUserBalance(uid: string, onChange: (balance: number) => void) {
  return watchDemoState((state) => onChange(state.people[uid]?.outstandingBalance ?? 0));
}
