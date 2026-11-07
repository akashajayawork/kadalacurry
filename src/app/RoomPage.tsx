import { PATHS } from "@/constants/routes";
import { SignInGate } from "@/features/auth";
import { RoomSession } from "@/features/rooms";

import { AppShell } from "./AppShell";

/** /<roomId>: sign in, then members get the app and anyone else asks to join. */
export function RoomPage({ roomId }: { roomId: string }) {
  return (
    <SignInGate
      extra={
        <p className="auth-room-link">
          {window.location.host}
          {PATHS.room(roomId)}
        </p>
      }
    >
      <RoomSession roomId={roomId}>
        <AppShell />
      </RoomSession>
    </SignInGate>
  );
}
