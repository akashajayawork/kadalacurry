import type { GoogleAccount } from "@/types";

/**
 * The owner of the whole app. Only this Google account can open /admin,
 * approve new rooms and delete them. It's also checked in firestore.rules
 * (isMainAdmin), so change both together.
 */
export const MAIN_ADMIN_EMAIL = "akashajayawork@gmail.com";

export function isMainAdmin(account: GoogleAccount | null): boolean {
  return Boolean(
    account?.emailVerified && account.email?.toLowerCase() === MAIN_ADMIN_EMAIL
  );
}
