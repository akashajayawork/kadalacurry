import { ChevronRight } from "lucide-react";

import { PATHS } from "@/constants/routes";
import type { RoomSummary } from "@/types";
import { getInitial } from "@/utils/name";

/** Rooms to jump back into, one row each. */
export function RoomLinks({ rooms }: { rooms: RoomSummary[] }) {
  return (
    <ul className="landing-room-list">
      {rooms.map((room) => (
        <li key={room.id}>
          <a className="landing-room" href={PATHS.room(room.id)}>
            <span className="avatar">{getInitial(room.name)}</span>
            <span className="landing-room-name">{room.name}</span>
            <ChevronRight size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
