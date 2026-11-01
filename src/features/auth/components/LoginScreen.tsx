import { EasterEgg } from "@/components/ui";

import { AuthCard } from "./AuthCard";

type LoginScreenProps = {
  onSignIn: () => void;
};

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  return (
    <AuthCard>
      <EasterEgg slot="login" />
      <h1 className="auth-title">Your shared kitchen, made simple.</h1>
      <p className="auth-text">Order meals, split the bill and stay square with your roommates.</p>
      <button type="button" className="button button-primary button-block" onClick={onSignIn}>
        Continue with Google
      </button>
    </AuthCard>
  );
}
