import { useContext } from "react";

import type { AppUser } from "@/types";

import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}

/** Returns the signed-in user. Only use inside screens rendered by <AuthGate>. */
export function useCurrentUser(): AppUser {
  const { user } = useAuth();

  if (!user) {
    throw new Error("useCurrentUser must be used inside <AuthGate>.");
  }

  return user;
}
