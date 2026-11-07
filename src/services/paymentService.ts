import { buildUpiLink, getPlatform, type UpiApp, type UpiPayment } from "@/utils/upi";

/** "simulated": nothing was opened (the demo). */
export type UpiLaunch = "opened" | "simulated";

/** UPI apps only open on a phone. */
export function canOpenUpiApps(): boolean {
  return getPlatform(navigator.userAgent) !== "other";
}

/**
 * Opens Google Pay (or the phone's UPI app) with the payee and amount filled
 * in. A web page can't see whether the payment went through, so the caller
 * asks once the user comes back.
 */
export function openUpiPayment(app: UpiApp, payment: UpiPayment): UpiLaunch {
  window.location.href = buildUpiLink(app, payment, getPlatform(navigator.userAgent));
  return "opened";
}
