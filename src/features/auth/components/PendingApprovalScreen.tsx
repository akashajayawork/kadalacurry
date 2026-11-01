import { AuthCard } from "./AuthCard";

type PendingApprovalScreenProps = {
  email: string | null;
  onSignOut: () => void;
};

export function PendingApprovalScreen({ email, onSignOut }: PendingApprovalScreenProps) {
  return (
    <AuthCard>
      <h1 className="auth-title">Access pending</h1>
      <p className="auth-text">
        Your request has been sent to the admin. You'll get in automatically as soon as they
        approve you, so you can keep this page open.
      </p>

      {email && (
        <p className="auth-account">
          Signed in as <strong>{email}</strong>
        </p>
      )}

      <p className="auth-waiting" role="status">
        <span className="auth-waiting-dot" aria-hidden="true" />
        Waiting for approval
      </p>

      <button type="button" className="button button-secondary button-block" onClick={onSignOut}>
        Sign out
      </button>
    </AuthCard>
  );
}
