import { LogOut, Plus } from "lucide-react";

import { BrandButton, CoffeeLink } from "@/components/brand";
import { PATHS } from "@/constants/routes";
import { AuthCard, SignInGate, useAuth } from "@/features/auth";

import { MoveHouseCard } from "../components/MoveHouseCard";
import { RoomList } from "../components/RoomList";
import { RoomRequestList } from "../components/RoomRequestList";
import "../console.css";

/** /admin: the main admin approves new rooms, deletes rooms and moves the original house. */
export function AdminConsolePage() {
  return (
    <SignInGate title="Admin" text="Sign in with the kadalacurry admin account.">
      <ConsoleGate />
    </SignInGate>
  );
}

function ConsoleGate() {
  const { isMainAdmin, account, signOut } = useAuth();

  if (!isMainAdmin) {
    return (
      <AuthCard>
        <h1 className="auth-title">Admins only</h1>
        <p className="auth-text">
          This page is for the kadalacurry admin. You're signed in as{" "}
          <strong>{account?.email}</strong>.
        </p>
        <a className="button button-primary button-block" href={PATHS.home}>
          Go home
        </a>
        <button type="button" className="button button-secondary button-block" onClick={signOut}>
          Sign out
        </button>
      </AuthCard>
    );
  }

  return <Console />;
}

function Console() {
  const { account, signOut } = useAuth();

  return (
    <div className="console">
      <header className="console-header">
        <BrandButton />
        <button type="button" className="pill-button" onClick={signOut}>
          <LogOut size={15} />
          Sign out
        </button>
      </header>

      <main className="console-content">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">{account?.email}</p>
        </div>

        <RoomRequestList />
        <RoomList />

        <a className="button button-secondary button-block" href={PATHS.create}>
          <Plus size={18} />
          Make a room of your own
        </a>

        <MoveHouseCard />

        <section className="console-section" aria-labelledby="coffee-title">
          <h2 id="coffee-title" className="section-title">
            Buy me a coffee
          </h2>
          <p className="muted-text">
            Shown on the demo and in About (tap the logo). The link lives in
            src/config/support.ts.
          </p>
          <CoffeeLink />
        </section>
      </main>
    </div>
  );
}
