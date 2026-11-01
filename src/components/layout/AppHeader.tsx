import { LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Dialog, Wordmark } from "@/components/ui";
import { getInitial } from "@/utils/name";

import "./AppHeader.css";

type AppHeaderProps = {
  userName: string | null;
  userEmail: string | null;
  /** A number shown on the avatar, e.g. people waiting for access. Hidden at 0. */
  badgeCount?: number;
  /** Extra sections for the account sheet, shown above Sign out. */
  accountExtras?: ReactNode;
  onSignOut: () => void;
};

export function AppHeader({
  userName,
  userEmail,
  badgeCount = 0,
  accountExtras,
  onSignOut,
}: AppHeaderProps) {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Wordmark />

        <button
          type="button"
          className="avatar app-header-avatar"
          onClick={() => setAccountOpen(true)}
          aria-label={badgeCount > 0 ? `Account, ${badgeCount} waiting for access` : "Account"}
        >
          {getInitial(userName)}
          {badgeCount > 0 && (
            <span key={badgeCount} className="app-header-badge" aria-hidden="true">
              {badgeCount}
            </span>
          )}
        </button>
      </div>

      <Dialog open={accountOpen} onClose={() => setAccountOpen(false)} label="Account">
        <div className="account-sheet">
          <div className="account-sheet-profile">
            <span className="avatar avatar-lg">{getInitial(userName)}</span>
            <p className="account-sheet-name">{userName}</p>
            <p className="muted-text">{userEmail ?? "Signed in with Google"}</p>
          </div>

          {accountExtras}

          <div className="dialog-actions">
            <button type="button" className="button button-secondary button-block" onClick={onSignOut}>
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
