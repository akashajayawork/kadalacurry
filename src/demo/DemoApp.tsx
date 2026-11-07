import { useMemo, useState } from "react";

import { AppShell } from "@/app/AppShell";
import { ToastProvider } from "@/components/feedback";
import { StaticAuthProvider } from "@/features/auth";

import { DemoBanner } from "./DemoBanner";
import { createDemoUser, PLACEHOLDER_NAME } from "./seed";
import { startDemo } from "./store";
import { WelcomeDialog } from "./WelcomeDialog";

// Nothing is saved, so "signing out" simply starts the demo over.
const restartDemo = () => window.location.reload();

/**
 * The real app, signed in as the sample household's admin under the
 * visitor's name. The demo build swaps every Firebase service for the
 * in-memory one in ./services.
 */
export function DemoApp() {
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const user = useMemo(() => createDemoUser(visitorName ?? PLACEHOLDER_NAME), [visitorName]);

  const handleStart = (name: string) => {
    startDemo(name);
    setVisitorName(name);
  };

  return (
    <ToastProvider>
      <StaticAuthProvider user={user} isAdmin onSignOut={restartDemo}>
        <DemoBanner onRestart={restartDemo} />
        <AppShell />
        <WelcomeDialog open={visitorName === null} onStart={handleStart} />
      </StaticAuthProvider>
    </ToastProvider>
  );
}
