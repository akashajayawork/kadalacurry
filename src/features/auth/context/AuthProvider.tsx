import { FirebaseError } from "firebase/app";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { useToast } from "@/components/feedback";
import { signInWithGoogle, signOutUser, subscribeToAuthChanges } from "@/services/authService";
import { checkApprovalAndSyncProfile, subscribeToApproval } from "@/services/userService";
import type { AppUser, GoogleAccount } from "@/types";

import { AuthContext, type AuthContextValue, type AuthStatus } from "./AuthContext";

/** Closing the Google popup isn't an error worth showing. */
const DISMISSED_POPUP_CODES = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function AuthProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  // The Google account that's signed in right now (null when signed out).
  const accountRef = useRef<GoogleAccount | null>(null);

  /** Checks whether the account is approved and moves to the matching status. */
  const verifyAccess = useCallback(async (account: GoogleAccount) => {
    // Ignore the result if someone else signed in meanwhile.
    const isCurrent = () => accountRef.current?.uid === account.uid;

    setStatus("loading");
    setError("");

    try {
      const result = await checkApprovalAndSyncProfile(account);
      if (!isCurrent()) return;

      if (result.approved) {
        setUser({
          uid: account.uid,
          displayName: result.name ?? account.displayName,
          email: account.email,
        });
        setIsAdmin(result.isAdmin);
        setStatus("approved");
      } else {
        setStatus("pending");
      }
    } catch (approvalError) {
      console.error("Account approval check failed:", approvalError);
      if (!isCurrent()) return;

      setError("We couldn't verify your access. Check your internet connection and try again.");
      setStatus("error");
    }
  }, []);

  // Listen for Google sign-in changes.
  useEffect(
    () =>
      subscribeToAuthChanges((account) => {
        accountRef.current = account;
        setIsAdmin(false);

        if (!account) {
          setUser(null);
          setError("");
          setStatus("signed-out");
          return;
        }

        setUser({ uid: account.uid, displayName: account.displayName, email: account.email });
        void verifyAccess(account);
      }),
    [verifyAccess]
  );

  // While pending, let them in as soon as the admin approves the account.
  useEffect(() => {
    if (status !== "pending" || !user) return;

    return subscribeToApproval(
      user.uid,
      () => {
        if (accountRef.current) void verifyAccess(accountRef.current);
      },
      (approvalError) => console.error("Approval listener error:", approvalError)
    );
  }, [status, user, verifyAccess]);

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
    () => ({ status, user, isAdmin, error, signIn, signOut }),
    [status, user, isAdmin, error, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
