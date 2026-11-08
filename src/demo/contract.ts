/*
 * Compile-time check only (nothing imports this file): each demo service must
 * offer the same functions as the real Firebase service it replaces in the
 * demo build, so the two can't drift apart. If you change a real service,
 * `tsc` points here until the demo copy matches.
 */
import type * as RealAuth from "@/services/authService";
import type * as RealDebts from "@/services/debtService";
import type * as RealJoinRequests from "@/services/joinRequestService";
import type * as RealMembers from "@/services/memberService";
import type * as RealMyRooms from "@/services/myRoomsService";
import type * as RealOrders from "@/services/orderService";
import type * as RealPayments from "@/services/paymentService";
import type * as RealRooms from "@/services/roomService";
import type * as RealSettlements from "@/services/settlementService";
import type * as RealVendor from "@/services/vendorService";

import type * as DemoAuth from "./services/authService";
import type * as DemoDebts from "./services/debtService";
import type * as DemoJoinRequests from "./services/joinRequestService";
import type * as DemoMembers from "./services/memberService";
import type * as DemoMyRooms from "./services/myRoomsService";
import type * as DemoOrders from "./services/orderService";
import type * as DemoPayments from "./services/paymentService";
import type * as DemoRooms from "./services/roomService";
import type * as DemoSettlements from "./services/settlementService";
import type * as DemoVendor from "./services/vendorService";

type Matches<Demo extends Real, Real> = [Demo, Real];

export type DemoServicesMatchReal = [
  Matches<typeof DemoAuth, typeof RealAuth>,
  Matches<typeof DemoDebts, typeof RealDebts>,
  Matches<typeof DemoJoinRequests, typeof RealJoinRequests>,
  Matches<typeof DemoMembers, typeof RealMembers>,
  Matches<typeof DemoMyRooms, typeof RealMyRooms>,
  Matches<typeof DemoOrders, typeof RealOrders>,
  Matches<typeof DemoPayments, typeof RealPayments>,
  Matches<typeof DemoRooms, typeof RealRooms>,
  Matches<typeof DemoSettlements, typeof RealSettlements>,
  Matches<typeof DemoVendor, typeof RealVendor>,
];
