/**
 * Street-art easter eggs: small images or GIFs sprinkled around the app.
 *
 * To add one, drop the file into src/assets/easter-eggs/ and register it:
 *
 *   import sprayCan from "@/assets/easter-eggs/spray-can.gif";
 *
 *   export const EASTER_EGGS: ... = {
 *     "home-greeting": { src: sprayCan, alt: "" },
 *   };
 *
 * Empty slots render nothing in production. In development they show a faint
 * dashed placeholder so you can see where they sit (see SHOW_EMPTY_SLOTS).
 */

import drag from "@/assets/easter-eggs/drag.png";
import rich from "@/assets/easter-eggs/rich.jpg";
import money from "@/assets/easter-eggs/money.jpg";
import loan from "@/assets/easter-eggs/loan.jpg";
import bat from "@/assets/easter-eggs/bat.png";
import sad from "@/assets/easter-eggs/sad.png";
import pfp from "@/assets/easter-eggs/pfp.png";
import due from "@/assets/easter-eggs/due.jpg";
import oneUp from "@/assets/easter-eggs/1up.png";
import demo from "@/assets/easter-eggs/demo.jpg";
import documentArt from "@/assets/easter-eggs/document.jpg";




/** Every slot and its default size in pixels. */
export const EASTER_EGG_SLOTS = {
  login: 96,
  "home-greeting": 64,
  "home-due": 56,
  "meal-empty": 28,
  "meal-paid": 56,
  "calendar-header": 44,
  "calendar-empty-day": 64,
  "accounts-total": 56,
  "accounts-all-square": 48,
  "settle-success": 72,
  // These three replace part of the UI, so an empty slot brings the original back
  // (the "+₹50" text, the sparkle icon, the download arrow) rather than a placeholder.
  /** Floats up from the Add button when a meal is added. */
  "meal-added": 76,
  /** The icon on the home page's "Try the demo" square. */
  "demo-tile": 56,
  /** Beside "PDF" on the payment history's download button. */
  "history-download": 22,
} as const;

export type EasterEggSlot = keyof typeof EASTER_EGG_SLOTS;

export type EasterEggAsset = {
  src: string;
  alt?: string;
  /** Overrides the slot's default size (px). */
  size?: number;
  /**
   * Rounds the corners (px); half the slot size makes a circle. A rounded image
   * is shown as-is (white areas aren't blended into the page) and fills its
   * whole square slot, so a non-square image gets its edges cropped.
   */
  radius?: number;
};

export const EASTER_EGGS: Partial<Record<EasterEggSlot, EasterEggAsset>> = {
  login: { src: drag },
  "home-greeting": { src: pfp},
  "home-due": { src: due },
  "meal-empty": { src: drag },
  "calendar-header": { src: bat },
  "calendar-empty-day": { src: sad },
  "accounts-total": { src: money },
  "accounts-all-square": { src: loan, radius: 12 },
  "settle-success": { src: rich },
  "meal-added": { src: oneUp, alt: "1UP" },
  "demo-tile": { src: demo },
  "history-download": { src: documentArt },
};

export const SHOW_EMPTY_SLOTS = import.meta.env.DEV;
