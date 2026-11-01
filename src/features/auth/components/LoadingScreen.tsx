import { LoaderCircle } from "lucide-react";

import { AuthCard } from "./AuthCard";

export function LoadingScreen() {
  return (
    <AuthCard>
      <p className="auth-text auth-loading">
        <LoaderCircle size={18} className="spin" />
        Checking your account…
      </p>
    </AuthCard>
  );
}
