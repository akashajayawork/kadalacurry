import { useEffect, useState } from "react";

import {
  AccessErrorScreen,
  AuthCard,
  LoadingScreen,
  PendingScreen,
  useAccount,
  useAuth,
} from "@/features/auth";
import { requestRoom, subscribeToMyRoomRequest } from "@/services/roomRequestService";

import { CreateRoomForm } from "./CreateRoomForm";

type RequestState =
  | "loading"
  /** Never asked (or asked again after a decline): a request is sent. */
  | "none"
  | "pending"
  | "approved"
  /** The main admin said no. */
  | "declined"
  /** Approved and already used to create a room. */
  | "used";

/**
 * Signing in here asks the main admin for a room. Once they approve, the
 * person names the room and sets it up. The main admin skips the request.
 */
export function CreateRoomFlow() {
  const account = useAccount();
  const { isMainAdmin, signOut } = useAuth();
  const [state, setState] = useState<RequestState>("loading");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isMainAdmin) return;

    let lastStatus: "pending" | "approved" | null = null;

    return subscribeToMyRoomRequest(
      account.uid,
      (request) => {
        if (request) {
          setState(request.status);
        } else if (lastStatus) {
          // A request that disappears was either declined or used to create a room.
          setState(lastStatus === "approved" ? "used" : "declined");
        } else {
          setState("none");
        }
        lastStatus = request?.status ?? null;
      },
      (error) => {
        console.error("Room request listener error:", error);
        setFailed(true);
      }
    );
  }, [account.uid, isMainAdmin]);

  useEffect(() => {
    if (state !== "none") return;

    requestRoom(account).catch((error) => {
      console.error("Couldn't send the room request:", error);
      setFailed(true);
    });
  }, [state, account]);

  if (isMainAdmin) return <CreateRoomForm />;

  if (failed) {
    return (
      <AccessErrorScreen
        message="We couldn't reach kadalacurry. Check your internet connection and try again."
        onSignOut={signOut}
      />
    );
  }

  switch (state) {
    case "loading":
    case "none":
    case "used":
      return <LoadingScreen />;
    case "pending":
      return (
        <PendingScreen
          title="Request sent"
          message="Your request for a room has been sent to the kadalacurry admin. Once it's approved you'll name your room right here, so you can keep this page open."
          email={account.email}
          onSignOut={signOut}
        />
      );
    case "declined":
      return (
        <AuthCard>
          <h1 className="auth-title">Request declined</h1>
          <p className="auth-text">The kadalacurry admin didn't approve this room request.</p>
          <button
            type="button"
            className="button button-primary button-block"
            onClick={() => setState("none")}
          >
            Ask again
          </button>
          <button type="button" className="button button-secondary button-block" onClick={signOut}>
            Sign out
          </button>
        </AuthCard>
      );
    case "approved":
      return <CreateRoomForm />;
  }
}
