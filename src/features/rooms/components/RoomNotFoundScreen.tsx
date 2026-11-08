import { AuthCard } from "@/features/auth";
import { PATHS } from "@/constants/routes";

type RoomNotFoundScreenProps = {
  roomId: string;
  onSignOut: () => void;
};

export function RoomNotFoundScreen({ roomId, onSignOut }: RoomNotFoundScreenProps) {
  return (
    <AuthCard>
      <h1 className="auth-title">No room here</h1>
      <p className="auth-text">
        There's no room called <strong>{roomId}</strong>. Check the link with whoever sent it,
        or make a room of your own.
      </p>
      <a className="button button-primary button-block" href={PATHS.create}>
        Make a room
      </a>
      <a className="button button-secondary button-block" href={PATHS.home}>
        Go home
      </a>
      <button type="button" className="auth-link" onClick={onSignOut}>
        Sign out
      </button>
    </AuthCard>
  );
}
