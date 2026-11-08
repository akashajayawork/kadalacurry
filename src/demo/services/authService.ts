// Demo stand-in for src/services/authService.ts: the demo never signs in to Google.
export function subscribeToAuthChanges() {
  return () => {};
}

export async function signInWithGoogle(): Promise<void> {}

export async function signOutUser(): Promise<void> {}
