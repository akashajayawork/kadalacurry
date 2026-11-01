import { AuthCard } from "./AuthCard";

type AccessErrorScreenProps = {
  message: string;
  onSignOut: () => void;
};

export function AccessErrorScreen({ message, onSignOut }: AccessErrorScreenProps) {
  return (
    <AuthCard>
      <h1 className="auth-title">Couldn't verify access</h1>
      <p className="auth-text">{message}</p>
      <button type="button" className="button button-secondary button-block" onClick={onSignOut}>
        Sign out
      </button>
    </AuthCard>
  );
}
