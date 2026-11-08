// Demo stand-in for src/services/paymentService.ts: nothing is opened, the app just asks as if it had been.
export type UpiLaunch = "opened" | "simulated";

/** The demo shows the Google Pay buttons everywhere, phone or not. */
export function canOpenUpiApps(): boolean {
  return true;
}

export function openUpiPayment(): UpiLaunch {
  return "simulated";
}
