/** The Google account someone signed in with. */
export type GoogleAccount = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

/** The signed-in user as the app sees them. */
export type AppUser = {
  uid: string;
  /** The name the admin gave them, falling back to their Google name. */
  displayName: string | null;
  email: string | null;
};
