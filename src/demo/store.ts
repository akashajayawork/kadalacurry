import type { AccessRequest, DailyOrder, Settlement, VendorBoard } from "@/types";

import type { DemoDebts } from "./ledger";
import { createDemoState, PLACEHOLDER_NAME } from "./seed";

/*
 * The demo's stand-in for Firestore: plain in-memory data, so nothing is saved
 * and every visit (or refresh) starts from the same sample household.
 */

export type DemoPerson = {
  name: string;
  outstandingBalance: number;
  email?: string | null;
  role?: "admin";
};

export type DemoState = {
  /** users/{uid} and roommates/{uid} in one. */
  people: Record<string, DemoPerson>;
  /** dailyOrders/{YYYY-MM-DD}_{uid} */
  orders: Record<string, DailyOrder>;
  /** debts/{uidA}_{uidB} */
  debts: DemoDebts;
  /** Payment history, oldest first. */
  settlements: Settlement[];
  accessRequests: Record<string, AccessRequest>;
  vendorBoard: VendorBoard | null;
};

let state: DemoState = createDemoState(PLACEHOLDER_NAME);
const listeners = new Set<() => void>();

const notifyListeners = () => listeners.forEach((listener) => queueMicrotask(listener));

export function getDemoState(): DemoState {
  return state;
}

/** Starts the household afresh with the visitor's name in it. */
export function startDemo(visitorName: string): void {
  state = createDemoState(visitorName);
  notifyListeners();
}

/** Applies a change, then tells every listener, like a Firestore write. Throws before changing anything to reject. */
export function updateDemoState(change: (state: DemoState) => void): void {
  change(state);
  notifyListeners();
}

/** Calls `emit` with the current state now (asynchronously, like a first snapshot) and after every change. */
export function watchDemoState(emit: (state: DemoState) => void): () => void {
  let active = true;
  const listener = () => {
    if (active) emit(state);
  };

  listeners.add(listener);
  queueMicrotask(listener);

  return () => {
    active = false;
    listeners.delete(listener);
  };
}

/** A short pause so saving feels like a real network call (spinners, animations). */
export function simulateLatency(ms = 350): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

let nextId = 1;

export function createDemoId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}
