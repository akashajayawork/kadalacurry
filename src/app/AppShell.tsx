import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";

import { AppHeader, BottomNav } from "@/components/layout";
import { AccountsPage } from "@/features/accounts";
import { RoomPanel, useJoinRequests } from "@/features/admin";
import { useAuth } from "@/features/auth";
import { CalendarPage } from "@/features/calendar";
import { HomePage } from "@/features/meals";
import { useCurrentUser, useRoom } from "@/features/rooms";
import { VendorBoardSync } from "@/features/vendor";
import { useSwipe } from "@/hooks/useSwipe";

import { TABS, type TabId } from "./navigation";
import "./AppShell.css";

const PAGES: Record<TabId, ComponentType> = {
  home: HomePage,
  calendar: CalendarPage,
  accounts: AccountsPage,
};

type NavState = {
  tab: TabId;
  /** Which way the page slides in. */
  direction: "forward" | "back";
};

const tabIndex = (tab: TabId) => TABS.findIndex((item) => item.id === tab);

function moveBy(current: NavState, step: 1 | -1): NavState {
  const next = TABS[tabIndex(current.tab) + step];
  return next ? { tab: next.id, direction: step > 0 ? "forward" : "back" } : current;
}

/** Layout for a room's members: header, the active page and the tab bar. Swipe to change tabs. */
export function AppShell() {
  const user = useCurrentUser();
  const { room } = useRoom();
  const { signOut } = useAuth();
  const joinRequests = useJoinRequests();
  const [nav, setNav] = useState<NavState>({ tab: "home", direction: "forward" });
  const contentRef = useRef<HTMLElement>(null);

  const goToTab = useCallback((tab: TabId) => {
    setNav((current) =>
      current.tab === tab
        ? current
        : { tab, direction: tabIndex(tab) > tabIndex(current.tab) ? "forward" : "back" }
    );
  }, []);

  const goToNextTab = useCallback(() => setNav((current) => moveBy(current, 1)), []);
  const goToPreviousTab = useCallback(() => setNav((current) => moveBy(current, -1)), []);

  // Finger moves left → next tab (like any swipeable tabs); right → previous tab.
  useSwipe(contentRef, { onSwipeLeft: goToNextTab, onSwipeRight: goToPreviousTab });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [nav.tab]);

  const ActivePage = PAGES[nav.tab];

  return (
    <div className="app-shell">
      <AppHeader
        userName={user.displayName}
        userEmail={user.email}
        badgeCount={joinRequests.length}
        accountExtras={<RoomPanel requests={joinRequests} />}
        onSignOut={signOut}
      />

      <main ref={contentRef} className="app-content">
        <div key={nav.tab} className={`app-page app-page-${nav.direction}`}>
          <ActivePage />
        </div>
      </main>

      <BottomNav items={TABS} activeId={nav.tab} onChange={goToTab} />

      {/* Keeps the room's public vendor board (vendor.html?room=…) up to date. */}
      <VendorBoardSync room={room} />
    </div>
  );
}
