import { createContext } from "react";

import type { GoogleAccount } from "@/types";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

/** The Google sign-in session. Room membership is handled per room (see features/rooms). */
export type AuthContextValue = {
  status: AuthStatus;
  account: GoogleAccount | null;
  /** The owner of the whole app (see config/mainAdmin.ts). */
  isMainAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
