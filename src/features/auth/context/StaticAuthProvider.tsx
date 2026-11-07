import { useMemo, type PropsWithChildren } from "react";

import type { GoogleAccount } from "@/types";

import { AuthContext, type AuthContextValue } from "./AuthContext";

type StaticAuthProviderProps = PropsWithChildren<{
  account: GoogleAccount;
  onSignOut: () => void;
}>;

/** A fixed signed-in session without Google sign-in (used by the demo). */
export function StaticAuthProvider({ account, onSignOut, children }: StaticAuthProviderProps) {
  const value = useMemo<AuthContextValue>(
    () => ({
      status: "signed-in",
      account,
      isMainAdmin: false,
      signIn: async () => {},
      signOut: async () => onSignOut(),
    }),
    [account, onSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
