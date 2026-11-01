import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "@/config/auth";

export function subscribeToAuthChanges(onChange: (user: User | null) => void) {
  return onAuthStateChanged(auth, onChange);
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
