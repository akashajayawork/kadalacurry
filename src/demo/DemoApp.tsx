import { AppShell } from "@/app/AppShell";
import { ToastProvider } from "@/components/feedback";
import { StaticAuthProvider } from "@/features/auth";

import { DemoBanner } from "./DemoBanner";
import { DEMO_USER } from "./seed";

// Nothing is saved, so "signing out" simply starts the demo over.
const restartDemo = () => window.location.reload();

/**
 * The real app, signed in as the sample household's admin. The demo build
 * swaps every Firebase service for the in-memory one in ./services.
 */
export function DemoApp() {
  return (
    <ToastProvider>
      <StaticAuthProvider user={DEMO_USER} isAdmin onSignOut={restartDemo}>
        <DemoBanner onRestart={restartDemo} />
        <AppShell />
      </StaticAuthProvider>
    </ToastProvider>
  );
}
