/** Someone who signed in to a room with Google and is waiting for its admin to let them in. */
export type JoinRequest = {
  uid: string;
  /** Their Google name. */
  name: string | null;
  email: string | null;
  photoURL: string | null;
  requestedAt: Date | null;
};
