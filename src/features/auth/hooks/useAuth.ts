import { useContext } from "react";

import type { GoogleAccount } from "@/types";

import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}

/** The signed-in Google account. Only use inside screens rendered by <SignInGate>. */
export function useAccount(): GoogleAccount {
  const { account } = useAuth();

  if (!account) {
    throw new Error("useAccount must be used inside <SignInGate>.");
  }

  return account;
}
