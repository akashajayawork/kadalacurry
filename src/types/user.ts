/** The Google account someone signed in with. */
export type GoogleAccount = {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  photoURL: string | null;
};

/** The signed-in member of the current room, as the app sees them. */
export type AppUser = {
  uid: string;
  /** The name the room admin gave them, falling back to their Google name. */
  displayName: string | null;
  email: string | null;
};
