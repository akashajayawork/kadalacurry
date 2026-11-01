import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";

/** "Akash Ajayan" → "Akash" */
export function getFirstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || DEFAULT_ROOMMATE_NAME;
}

export function getInitial(name: string | null | undefined): string {
  return (name?.trim().charAt(0) || "?").toUpperCase();
}
