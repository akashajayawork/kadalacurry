// Demo stand-in for src/services/debtService.ts (same functions, in memory).
import type { Debt } from "@/types";
import { toDebt } from "@/utils/debtPairs";

import { watchDemoState } from "../store";

export { getDebtId, getDebtPair, getPairAmountChange, toDebt } from "@/utils/debtPairs";

export function subscribeToDebts(uid: string, onChange: (debts: Debt[]) => void) {
  return watchDemoState((state) =>
    onChange(
      Object.entries(state.debts)
        .filter(([, record]) => record.users.includes(uid))
        .map(([id, record]) => toDebt(uid, id, record))
        .filter((debt) => debt.amount !== 0)
    )
  );
}
