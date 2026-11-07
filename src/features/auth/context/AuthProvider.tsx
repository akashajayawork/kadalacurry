import { FirebaseError } from "firebase/app";
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { useToast } from "@/components/feedback";
import { isMainAdmin } from "@/config/mainAdmin";
import { signInWithGoogle, signOutUser, subscribeToAuthChanges } from "@/services/authService";
import type { GoogleAccount } from "@/types";

import { AuthContext, type AuthContextValue, type AuthStatus } from "./AuthContext";

/** Closing the Google popup isn't an error worth showing. */
const DISMISSED_POPUP_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function AuthProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [account, setAccount] = useState<GoogleAccount | null>(null);

  useEffect(
    () =>
      subscribeToAuthChanges((nextAccount) => {
        setAccount(nextAccount);
        setStatus(nextAccount ? "signed-in" : "signed-out");
      }),
    []
  );

  const signIn = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (signInError) {
      if (signInError instanceof FirebaseError && DISMISSED_POPUP_CODES.has(signInError.code)) {
        return;
      }
      console.error("Google sign-in failed:", signInError);
      showToast("Google sign-in failed. Please try again.", "error");
    }
  }, [showToast]);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (signOutError) {
      console.error("Logout failed:", signOutError);
      showToast("Couldn't sign out. Please try again.", "error");
    }
  }, [showToast]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, account, isMainAdmin: isMainAdmin(account), signIn, signOut }),
    [status, account, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
