import { LoaderCircle, LogIn } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/features/auth";
import { getRecentRooms } from "@/features/rooms";
import { getFirstName } from "@/utils/name";

import { useMyRooms } from "../hooks/useMyRooms";
import { RoomLinks } from "./RoomLinks";

/**
 * Getting back into a room from the home page. Signed in: the rooms this
 * account is in. Signed out: rooms opened on this device, and a way to sign in.
 */
export function YourRooms() {
  const { status, account, signIn, signOut } = useAuth();
  const [recentRooms] = useState(getRecentRooms);
  const { rooms, loading, failed } = useMyRooms(status === "signed-in" ? (account?.uid ?? null) : null);

  if (status === "loading") return null;

  if (status === "signed-out") {
    return (
      <section className="landing-rooms" aria-label="Your rooms">
        {recentRooms.length > 0 && (
          <>
            <h2 className="landing-rooms-title">Your rooms</h2>
            <RoomLinks rooms={recentRooms} />
          </>
        )}
        <button type="button" className="landing-signin" onClick={signIn}>
          <LogIn size={17} />
          Already in a room? Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="landing-rooms" aria-labelledby="landing-rooms-title">
      <div className="landing-rooms-header">
        <h2 id="landing-rooms-title" className="landing-rooms-title">
          Your rooms
        </h2>
        <button type="button" className="landing-signout" onClick={signOut}>
          Not {getFirstName(account?.displayName)}? Sign out
        </button>
      </div>

      {loading ? (
        <p className="landing-rooms-note">
          <LoaderCircle size={16} className="spin" />
          Finding your rooms…
        </p>
      ) : failed ? (
        <p className="landing-rooms-note">Couldn't load your rooms. Check your connection and refresh.</p>
      ) : rooms.length > 0 ? (
        <RoomLinks rooms={rooms} />
      ) : (
        <p className="landing-rooms-note">
          You're not in a room yet. Ask your room admin for the room's link, or make one above.
        </p>
      )}
    </section>
  );
}
