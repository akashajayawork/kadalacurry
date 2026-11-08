import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Values come from .env.local (see .env.example), or .env.emulator for `npm run dev:emulator`.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const useEmulators = import.meta.env.VITE_USE_EMULATORS === "true";

export const app = initializeApp(firebaseConfig);

// Auth lives in ./auth so pages that don't sign in (the vendor board) skip it.
export const db = getFirestore(app);

// Ports match firebase.json.
if (useEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8085);
