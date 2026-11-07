import type { PropsWithChildren } from "react";

import { AuthCard } from "./AuthCard";

type PendingScreenProps = PropsWithChildren<{
  title: string;
  message: string;
  email: string | null;
  /** The pulsing status line. */
  waitingLabel?: string;
  onSignOut: () => void;
}>;

/** Waiting for someone to approve: a room's admin, or the main admin for a new room. */
export function PendingScreen({
  title,
  message,
  email,
  waitingLabel = "Waiting for approval",
  onSignOut,
  children,
}: PendingScreenProps) {
  return (
    <AuthCard>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-text">{message}</p>

      {email && (
        <p className="auth-account">
          Signed in as <strong>{email}</strong>
        </p>
      )}

      <p className="auth-waiting" role="status">
        <span className="auth-waiting-dot" aria-hidden="true" />
        {waitingLabel}
      </p>

      {children}

      <button type="button" className="button button-secondary button-block" onClick={onSignOut}>
        Sign out
      </button>
    </AuthCard>
  );
}
