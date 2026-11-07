import { onSnapshot, query, where } from "firebase/firestore";

import { ROOM_COLLECTIONS } from "@/constants/firestore";
import type { Debt } from "@/types";
import { toDebt, type DebtRecord } from "@/utils/debtPairs";

import { roomCollection } from "./refs";

// Debts live at rooms/{roomId}/debts/{uidA}_{uidB}; the pair maths is shared with the demo.
export { getDebtId, getDebtPair, getPairAmountChange, toDebt } from "@/utils/debtPairs";

/** Real-time list of the user's non-zero debts with other roommates. */
export function subscribeToDebts(
  roomId: string,
  uid: string,
  onChange: (debts: Debt[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(roomCollection(roomId, ROOM_COLLECTIONS.debts), where("users", "array-contains", uid)),
    (snapshot) => {
      onChange(
        snapshot.docs
          .map((document) => toDebt(uid, document.id, document.data() as DebtRecord))
          .filter((debt) => debt.amount !== 0)
      );
    },
    onError
  );
}
