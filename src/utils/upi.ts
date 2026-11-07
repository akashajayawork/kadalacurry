import type { PaymentMethod } from "@/types";

/** Where a room pays its meal bill. */
export type UpiTarget = { kind: "upi-id"; upiId: string } | { kind: "phone"; phone: string };

const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
const PHONE_PATTERN = /^(?:\+?91)?([6-9]\d{9})$/;

/** Reads what the room admin typed: a UPI ID (name@bank) or an Indian mobile number. */
export function parseUpiTarget(value: string): UpiTarget | null {
  const trimmed = value.trim();
  if (UPI_ID_PATTERN.test(trimmed)) return { kind: "upi-id", upiId: trimmed };

  const phone = trimmed.replace(/[\s-]/g, "").match(PHONE_PATTERN);
  return phone ? { kind: "phone", phone: phone[1] } : null;
}

/** "9876543210" → "98765 43210" */
export function formatPhone(phone: string): string {
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export type UpiPayment = {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
};

/** The UPI apps a payment can be opened in. */
export type UpiApp = Exclude<PaymentMethod, "other">;

type Platform = "android" | "ios" | "other";

export function getPlatform(userAgent: string): Platform {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  return "other";
}

const GOOGLE_PAY_ANDROID_PACKAGE = "com.google.android.apps.nbu.paisa.user";

/**
 * A link that opens a UPI app with the payee and amount filled in. "upi"
 * lets the phone pick (or ask which app to use); "gpay" goes straight to
 * Google Pay.
 */
export function buildUpiLink(app: UpiApp, payment: UpiPayment, platform: Platform): string {
  const params: Record<string, string> = {
    pa: payment.upiId,
    pn: payment.payeeName,
    am: payment.amount.toFixed(2),
    cu: "INR",
    tn: payment.note,
  };
  // Spaces as %20 (not +), and the @ in the UPI ID left as it is: some apps misread either.
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replaceAll("%40", "@")}`)
    .join("&");

  if (app === "gpay" && platform === "android") {
    return `intent://pay?${query}#Intent;scheme=upi;package=${GOOGLE_PAY_ANDROID_PACKAGE};end`;
  }
  if (app === "gpay" && platform === "ios") {
    return `gpay://upi/pay?${query}`;
  }
  return `upi://pay?${query}`;
}
