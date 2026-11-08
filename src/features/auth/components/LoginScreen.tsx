import type { PropsWithChildren } from "react";

import { EasterEgg } from "@/components/ui";

import { AuthCard } from "./AuthCard";

type LoginScreenProps = PropsWithChildren<{
  title?: string;
  text?: string;
  onSignIn: () => void;
}>;

export function LoginScreen({
  title = "Shared meal planner",
  text = "Order meals, split the bill and stay square",
  onSignIn,
  children,
}: LoginScreenProps) {
  return (
    <AuthCard>
      <EasterEgg slot="login" />
      <h1 className="auth-title">{title}</h1>
      <p className="auth-text">{text}</p>
      <button type="button" className="button button-primary button-block" onClick={onSignIn}>
        Continue with Google
      </button>
      {children}
    </AuthCard>
  );
}
