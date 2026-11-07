import { useMemo, type PropsWithChildren } from "react";

import type { AppUser } from "@/types";

import { AuthContext, type AuthContextValue } from "./AuthContext";

type StaticAuthProviderProps = PropsWithChildren<{
  user: AppUser;
  isAdmin?: boolean;
  onSignOut: () => void;
}>;

/** A fixed, already-approved session without Google sign-in (used by the demo). */
export function StaticAuthProvider({ user, isAdmin = false, onSignOut, children }: StaticAuthProviderProps) {
  const value = useMemo<AuthContextValue>(
    () => ({
      status: "approved",
      user,
      isAdmin,
      error: "",
      signIn: async () => {},
      signOut: async () => onSignOut(),
    }),
    [user, isAdmin, onSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
