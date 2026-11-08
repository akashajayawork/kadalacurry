import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { AccessErrorScreen, LoadingScreen, PendingScreen, useAccount, useAuth } from "@/features/auth";
import { requestToJoin } from "@/services/joinRequestService";
import { subscribeToMembership } from "@/services/memberService";
import { saveMyRoom } from "@/services/myRoomsService";
import { subscribeToRoom } from "@/services/roomService";
import type { Room, Roommate } from "@/types";

import { RoomContext, type RoomContextValue } from "../context/RoomContext";
import { forgetRoom, rememberRoom } from "../utils/recentRooms";
import { RemovedScreen } from "./RemovedScreen";
import { RoomNotFoundScreen } from "./RoomNotFoundScreen";

type Membership =
  | { state: "loading" }
  | { state: "member"; member: Roommate }
  /** Not in the room: a join request is sent and they wait for the room admin. */
  | { state: "pending" }
  /** Was in the room during this visit and the room admin removed them. */
  | { state: "removed" };

type RoomSessionProps = PropsWithChildren<{ roomId: string }>;

/**
 * Opens a room for the signed-in account. Members get in (children render
 * with the room in context); anyone else asks to join and waits for the room
 * admin, getting in automatically once approved.
 */
export function RoomSession({ roomId, children }: RoomSessionProps) {
  const account = useAccount();
  const { signOut } = useAuth();
  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [membership, setMembership] = useState<Membership>({ state: "loading" });
  const [failed, setFailed] = useState(false);

  useEffect(
    () =>
      subscribeToRoom(roomId, setRoom, (error) => {
        console.error("Room listener error:", error);
        setFailed(true);
      }),
    [roomId]
  );

  useEffect(() => {
    let wasMember = false;

    return subscribeToMembership(
      roomId,
      account.uid,
      (member) => {
        if (member) {
          wasMember = true;
          setMembership({ state: "member", member });
        } else {
          setMembership({ state: wasMember ? "removed" : "pending" });
        }
      },
      (error) => {
        console.error("Membership listener error:", error);
        setFailed(true);
      }
    );
  }, [roomId, account.uid]);

  // Signing in to a room is how you ask to join it.
  const roomExists = Boolean(room);
  const isPending = membership.state === "pending";

  useEffect(() => {
    if (!isPending || !roomExists) return;

    requestToJoin(roomId, account).catch((error) => {
      console.error("Couldn't send the join request:", error);
    });
  }, [isPending, roomExists, roomId, account]);

  const member = membership.state === "member" ? membership.member : null;
  const isMember = member !== null;
  const roomName = room?.name;

  // Remember the room: on this device, and on the account so the home page
  // can list it after signing in anywhere.
  useEffect(() => {
    if (!isMember || !roomName) return;

    rememberRoom({ id: roomId, name: roomName });
    saveMyRoom(account.uid, roomId, roomName).catch((error) => {
      console.error("Couldn't add the room to your list:", error);
    });
  }, [isMember, roomId, roomName, account.uid]);

  useEffect(() => {
    if (room === null) forgetRoom(roomId);
  }, [room, roomId]);

  const value = useMemo<RoomContextValue | null>(
    () =>
      room && member
        ? {
            roomId,
            room,
            user: { uid: account.uid, displayName: member.name, email: account.email },
            isRoomAdmin: room.adminUid === account.uid,
          }
        : null,
    [roomId, room, member, account]
  );

  if (failed) {
    return (
      <AccessErrorScreen
        message="We couldn't open this room. Check your internet connection and try again."
        onSignOut={signOut}
      />
    );
  }

  if (room === undefined || membership.state === "loading") return <LoadingScreen />;
  if (room === null) return <RoomNotFoundScreen roomId={roomId} onSignOut={signOut} />;

  if (membership.state === "removed") {
    return (
      <RemovedScreen
        roomName={room.name}
        onRejoin={() => setMembership({ state: "pending" })}
        onSignOut={signOut}
      />
    );
  }

  if (!value) {
    return (
      <PendingScreen
        title="Access pending"
        message={`Your request to join ${room.name} has been sent to ${room.adminName || "its admin"}. You'll get in automatically as soon as they approve you, so you can keep this page open.`}
        email={account.email}
        onSignOut={signOut}
      />
    );
  }

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
