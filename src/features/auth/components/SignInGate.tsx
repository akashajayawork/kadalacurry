import type { PropsWithChildren, ReactNode } from "react";

import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "./LoadingScreen";
import { LoginScreen } from "./LoginScreen";

type SignInGateProps = PropsWithChildren<{
  /** Shown on the sign-in screen. */
  title?: string;
  text?: string;
  /** Extra content for the sign-in screen, below the button. */
  extra?: ReactNode;
}>;

/** Renders its children only once someone is signed in with Google. */
export function SignInGate({ title, text, extra, children }: SignInGateProps) {
  const { status, signIn } = useAuth();

  switch (status) {
    case "loading":
      return <LoadingScreen />;
    case "signed-out":
      return (
        <LoginScreen title={title} text={text} onSignIn={signIn}>
          {extra}
        </LoginScreen>
      );
    case "signed-in":
      return <>{children}</>;
  }
}
