import { createContext } from "react";

import type { AppUser } from "@/types";

export type AuthStatus = "loading" | "signed-out" | "pending" | "error" | "approved";

export type AuthContextValue = {
  status: AuthStatus;
  user: AppUser | null;
  isAdmin: boolean;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
