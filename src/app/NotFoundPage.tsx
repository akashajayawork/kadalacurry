import { PATHS } from "@/constants/routes";
import { AuthCard } from "@/features/auth";

export function NotFoundPage() {
  return (
    <AuthCard>
      <h1 className="auth-title">Nothing here</h1>
      <p className="auth-text">This link doesn't go anywhere. Room links look like {PATHS.room("your-room")}.</p>
      <a className="button button-primary button-block" href={PATHS.home}>
        Go home
      </a>
    </AuthCard>
  );
}
