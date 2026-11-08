import type { PropsWithChildren } from "react";

import { BrandButton } from "@/components/brand";

import "../auth.css";

export function AuthCard({ children }: PropsWithChildren) {
  return (
    <main className="auth-screen">
      <div className="auth-card">
        <BrandButton className="auth-wordmark" />
        {children}
      </div>
    </main>
  );
}
