import type { Debt } from "@/types";

/** Totals across all of the user's debts. */
export function summarizeDebts(debts: Debt[]) {
  return debts.reduce(
    (totals, debt) =>
      debt.amount > 0
        ? { ...totals, owedToYou: totals.owedToYou + debt.amount }
        : { ...totals, youOwe: totals.youOwe - debt.amount },
    { owedToYou: 0, youOwe: 0 }
  );
}
