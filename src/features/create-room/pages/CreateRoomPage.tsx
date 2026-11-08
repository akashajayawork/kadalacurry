import { SignInGate } from "@/features/auth";

import { CreateRoomFlow } from "../components/CreateRoomFlow";
import "../create-room.css";

/** /create: ask the main admin for a room, then name it and set it up. */
export function CreateRoomPage() {
  return (
    <SignInGate
      title="Make a room"
      text="A room is your house in kadalacurry. Sign in with Google to ask for one: you'll be its admin."
    >
      <CreateRoomFlow />
    </SignInGate>
  );
}
