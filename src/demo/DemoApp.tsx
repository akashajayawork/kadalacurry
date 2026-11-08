import { useMemo, useState } from "react";

import { AppShell } from "@/app/AppShell";
import { ToastProvider } from "@/components/feedback";
import { StaticAuthProvider } from "@/features/auth";
import { RoomSession } from "@/features/rooms";

import { createDemoAccount, DEMO_ROOM_ID, PLACEHOLDER_NAME } from "./seed";
import { startDemo } from "./store";
import { logDemoVisit } from "./visitLog";
import { WelcomeDialog } from "./WelcomeDialog";

// Nothing is saved, so "signing out" simply starts the demo over.
const restartDemo = () => window.location.reload();

/**
 * The real app, signed in to the sample room as its admin under the
 * visitor's name. The demo build swaps every Firebase service for the
 * in-memory one in ./services; the only thing sent anywhere is the visitor's
 * name, for the main admin's list of demo visitors.
 */
export function DemoApp() {
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const account = useMemo(() => createDemoAccount(visitorName ?? PLACEHOLDER_NAME), [visitorName]);

  const handleStart = (name: string) => {
    logDemoVisit(name);
    startDemo(name);
    setVisitorName(name);
  };

  return (
    <ToastProvider>
      <StaticAuthProvider account={account} onSignOut={restartDemo}>
        <RoomSession roomId={DEMO_ROOM_ID}>
          <AppShell />
        </RoomSession>
        <WelcomeDialog open={visitorName === null} onStart={handleStart} />
      </StaticAuthProvider>
    </ToastProvider>
  );
}
