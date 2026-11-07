import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firestore";
import type { Debt } from "@/types";
import { toDebt, type DebtRecord } from "@/utils/debtPairs";

// Debts live at debts/{uidA}_{uidB}; the pair maths is shared with the demo.
export { getDebtId, getDebtPair, getPairAmountChange, toDebt } from "@/utils/debtPairs";

/** Real-time list of the user's non-zero debts with other roommates. */
export function subscribeToDebts(
  uid: string,
  onChange: (debts: Debt[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.debts), where("users", "array-contains", uid)),
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
