import type { Meal } from "./order";

export type MealSetting = {
  /** Whether the house orders this meal at all. */
  enabled: boolean;
  /** Fixed price per person, in rupees. */
  price: number;
};

export type MealSettings = Record<Meal, MealSetting>;

/** What the room admin can change at any time. The name can never change. */
export type RoomSettings = {
  meals: MealSettings;
  /** Where the house pays the meal bill: a UPI ID (name@bank) or a phone number. Empty if not set. */
  vendorUpi: string;
};

/** One house. Its id is the URL-safe form of its name and is also its link. */
export type Room = RoomSettings & {
  id: string;
  name: string;
  /** Every room has exactly one admin, who approves people and sets it up. */
  adminUid: string;
  adminName: string;
  createdAt: Date | null;
};

/** Someone asking the main admin for permission to create a room. */
export type RoomRequest = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  requestedAt: Date | null;
  status: "pending" | "approved";
};
