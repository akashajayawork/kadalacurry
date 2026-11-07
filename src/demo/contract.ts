/*
 * Compile-time check only (nothing imports this file): each demo service must
 * offer the same functions as the real Firebase service it replaces in the
 * demo build, so the two can't drift apart. If you change a real service,
 * `tsc` points here until the demo copy matches.
 */
import type * as RealAccess from "@/services/accessService";
import type * as RealAuth from "@/services/authService";
import type * as RealDebts from "@/services/debtService";
import type * as RealOrders from "@/services/orderService";
import type * as RealRoommates from "@/services/roommateService";
import type * as RealSettlements from "@/services/settlementService";
import type * as RealUsers from "@/services/userService";
import type * as RealVendor from "@/services/vendorService";

import type * as DemoAccess from "./services/accessService";
import type * as DemoAuth from "./services/authService";
import type * as DemoDebts from "./services/debtService";
import type * as DemoOrders from "./services/orderService";
import type * as DemoRoommates from "./services/roommateService";
import type * as DemoSettlements from "./services/settlementService";
import type * as DemoUsers from "./services/userService";
import type * as DemoVendor from "./services/vendorService";

type Matches<Demo extends Real, Real> = [Demo, Real];

export type DemoServicesMatchReal = [
  Matches<typeof DemoAccess, typeof RealAccess>,
  Matches<typeof DemoAuth, typeof RealAuth>,
  Matches<typeof DemoDebts, typeof RealDebts>,
  Matches<typeof DemoOrders, typeof RealOrders>,
  Matches<typeof DemoRoommates, typeof RealRoommates>,
  Matches<typeof DemoSettlements, typeof RealSettlements>,
  Matches<typeof DemoUsers, typeof RealUsers>,
  Matches<typeof DemoVendor, typeof RealVendor>,
];
