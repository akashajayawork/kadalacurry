import { useMemo, useState } from "react";

import { DEFAULT_ROOMMATE_NAME } from "@/constants/app";
import { useCurrentUser } from "@/features/auth";
import type { Debt, Person } from "@/types";

import { DebtList } from "../components/DebtList";
import { PaymentHistory } from "../components/PaymentHistory";
import { SettleBillDialog } from "../components/SettleBillDialog";
import { SettleDebtDialog } from "../components/SettleDebtDialog";
import { TotalDueCard } from "../components/TotalDueCard";
import { useDebts } from "../hooks/useDebts";
import { useRecentSettlements } from "../hooks/useRecentSettlements";
import { useRoommates } from "../hooks/useRoommates";
import "../accounts.css";

export function AccountsPage() {
  const user = useCurrentUser();
  const { roommates, loading, error } = useRoommates();
  const debts = useDebts(user.uid);
  const { settlements, loading: historyLoading } = useRecentSettlements();

  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const namesById = useMemo(
    () => new Map(roommates.map((roommate) => [roommate.id, roommate.name])),
    [roommates]
  );
  const getName = (userId: string) => namesById.get(userId) ?? DEFAULT_ROOMMATE_NAME;
  const me: Person = {
    id: user.uid,
    name: namesById.get(user.uid) ?? user.displayName ?? DEFAULT_ROOMMATE_NAME,
  };

  return (
    <div className="accounts">
      <h1 className="page-title">Accounts</h1>
      {error && <p className="form-error">{error}</p>}

      <TotalDueCard
        roommates={roommates}
        currentUserId={user.uid}
        loading={loading}
        onSettle={() => setBillDialogOpen(true)}
      />

      <section className="accounts-section" aria-labelledby="balances-title">
        <h2 id="balances-title" className="section-title">
          Who owes who
        </h2>
        <DebtList debts={debts} getName={getName} onSelect={setSelectedDebt} />
      </section>

      <PaymentHistory settlements={settlements} loading={historyLoading} currentUserId={user.uid} />

      <SettleBillDialog
        open={billDialogOpen}
        onClose={() => setBillDialogOpen(false)}
        payer={me}
        roommates={roommates}
      />
      <SettleDebtDialog
        debt={selectedDebt}
        currentUser={me}
        getName={getName}
        onClose={() => setSelectedDebt(null)}
      />
    </div>
  );
}
