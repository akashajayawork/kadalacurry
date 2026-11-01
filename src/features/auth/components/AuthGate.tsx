import type { PropsWithChildren } from "react";

import { useAuth } from "../hooks/useAuth";
import { AccessErrorScreen } from "./AccessErrorScreen";
import { LoadingScreen } from "./LoadingScreen";
import { LoginScreen } from "./LoginScreen";
import { PendingApprovalScreen } from "./PendingApprovalScreen";

/** Renders its children only for signed-in, admin-approved users. */
export function AuthGate({ children }: PropsWithChildren) {
  const { status, error, user, signIn, signOut } = useAuth();

  switch (status) {
    case "loading":
      return <LoadingScreen />;
    case "signed-out":
      return <LoginScreen onSignIn={signIn} />;
    case "pending":
      return <PendingApprovalScreen email={user?.email ?? null} onSignOut={signOut} />;
    case "error":
      return <AccessErrorScreen message={error} onSignOut={signOut} />;
    case "approved":
      return <>{children}</>;
  }
}
