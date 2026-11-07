import { ArrowRight, ChevronRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { EasterEgg } from "@/components/ui";
import { PATHS } from "@/constants/routes";
import { AuthCard } from "@/features/auth";
import { getRecentRooms } from "@/features/rooms";
import { getInitial } from "@/utils/name";
import { toRoomId } from "@/utils/roomName";

import "../landing.css";

/** The home page: back to your rooms, open one by name, make one, or try the demo. */
export function LandingPage() {
  const [recentRooms] = useState(getRecentRooms);
  const [roomName, setRoomName] = useState("");
  const roomId = toRoomId(roomName);

  const handleOpen = (event: FormEvent) => {
    event.preventDefault();
    if (roomId.length >= 3) window.location.assign(PATHS.room(roomId));
  };

  return (
    <AuthCard>
      <EasterEgg slot="login" />
      <h1 className="auth-title">Shared meal planner</h1>
      <p className="auth-text">Order meals, split the bill and stay square</p>

      {recentRooms.length > 0 && (
        <ul className="landing-rooms" aria-label="Your rooms">
          {recentRooms.map((room) => (
            <li key={room.id}>
              <a className="landing-room" href={PATHS.room(room.id)}>
                <span className="avatar">{getInitial(room.name)}</span>
                <span className="landing-room-name">{room.name}</span>
                <ChevronRight size={18} />
              </a>
            </li>
          ))}
        </ul>
      )}

      <form className="landing-open" onSubmit={handleOpen}>
        <label className="field">
          <span className="field-label">{recentRooms.length > 0 ? "Another room" : "Open your room"}</span>
          <span className="landing-open-row">
            <input
              className="field-input"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Room name"
              maxLength={40}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="button button-primary landing-open-go"
              disabled={roomId.length < 3}
              aria-label="Open room"
            >
              <ArrowRight size={19} />
            </button>
          </span>
        </label>
      </form>

      <a className="button button-secondary button-block" href={PATHS.create}>
        Make a room for your house
      </a>
      <a className="auth-link" href={PATHS.demo}>
        Try the demo
      </a>
    </AuthCard>
  );
}
