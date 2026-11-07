import { AuthCard } from "@/features/auth";

type RemovedScreenProps = {
  roomName: string;
  onRejoin: () => void;
  onSignOut: () => void;
};

export function RemovedScreen({ roomName, onRejoin, onSignOut }: RemovedScreenProps) {
  return (
    <AuthCard>
      <h1 className="auth-title">You've left {roomName}</h1>
      <p className="auth-text">
        The room admin removed you from this room. Your past orders and payments are still there.
      </p>
      <button type="button" className="button button-primary button-block" onClick={onRejoin}>
        Ask to join again
      </button>
      <button type="button" className="button button-secondary button-block" onClick={onSignOut}>
        Sign out
      </button>
    </AuthCard>
  );
}
