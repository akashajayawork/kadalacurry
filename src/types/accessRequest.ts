/** Someone who signed in with Google and is waiting for the admin to let them in. */
export type AccessRequest = {
  uid: string;
  /** Their Google name. */
  name: string | null;
  email: string | null;
  photoURL: string | null;
  requestedAt: Date | null;
};
