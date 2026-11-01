import type { PropsWithChildren } from "react";

import { Wordmark } from "@/components/ui";

import "../auth.css";

export function AuthCard({ children }: PropsWithChildren) {
  return (
    <main className="auth-screen">
      <div className="auth-card">
        <Wordmark className="auth-wordmark" />
        {children}
      </div>
    </main>
  );
}
