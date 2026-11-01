import { CalendarDays, House, Wallet } from "lucide-react";

import type { NavItem } from "@/components/layout";

export type TabId = "home" | "calendar" | "accounts";

/** Bottom tabs, in swipe order. */
export const TABS: readonly NavItem<TabId>[] = [
  { id: "home", label: "Home", icon: House },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "accounts", label: "Accounts", icon: Wallet },
];
