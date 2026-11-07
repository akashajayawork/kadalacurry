import { Copy, Lock } from "lucide-react";

import { useToast } from "@/components/feedback";
import { absoluteUrl, PATHS } from "@/constants/routes";
import { useRoom } from "@/features/rooms";

const IS_DEMO = import.meta.env.MODE === "demo";

/** The room's name and the links to share. Shown to everyone in the account sheet. */
export function RoomInfo() {
  const { roomId, room, isRoomAdmin } = useRoom();

  return (
    <section className="setup-section room-info" aria-label="Room">
      <div className="room-info-name">
        <div>
          <p className="eyebrow">Room</p>
          <p className="room-info-title">{room.name}</p>
        </div>
        {isRoomAdmin && (
          <span className="room-info-lock">
            <Lock size={13} strokeWidth={2.4} />
            Name can't change
          </span>
        )}
      </div>

      {IS_DEMO ? (
        <p className="setup-hint">
          In a real room you'd share the room link with your roommates and the vendor link with
          your meal vendor.
        </p>
      ) : (
        <>
          <ShareLink
            label="Room link"
            hint="Roommates sign in here to join"
            url={absoluteUrl(PATHS.room(roomId))}
          />
          <ShareLink
            label="Vendor link"
            hint="The due and meal counts, no sign-in"
            url={absoluteUrl(PATHS.vendor(roomId))}
          />
        </>
      )}
    </section>
  );
}

function ShareLink({ label, hint, url }: { label: string; hint: string; url: string }) {
  const { showToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(`${label} copied`, "success");
    } catch {
      showToast("Couldn't copy. Long-press the link instead.", "error");
    }
  };

  return (
    <div className="share-link">
      <span className="share-link-text">
        <span className="share-link-label">{label}</span>
        <a className="share-link-url" href={url} target="_blank" rel="noreferrer">
          {url.replace(/^https?:\/\//, "")}
        </a>
        <span className="share-link-hint">{hint}</span>
      </span>
      <button type="button" className="pill-button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
        <Copy size={15} />
        Copy
      </button>
    </div>
  );
}
