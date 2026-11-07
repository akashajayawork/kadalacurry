import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

import { auth } from "@/config/auth";
import type { GoogleAccount } from "@/types";

export function subscribeToAuthChanges(onChange: (account: GoogleAccount | null) => void) {
  return onAuthStateChanged(auth, (user) =>
    onChange(
      user && {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
      }
    )
  );
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
