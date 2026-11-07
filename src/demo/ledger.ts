import { getDebtPair, getPairAmountChange, type DebtRecord } from "@/utils/debtPairs";

export type DemoDebts = Record<string, DebtRecord & { amount: number }>;

/** Records that `debtorId` owes `creditorId` `amount` more, netting against what's already owed. */
export function addDebt(
  debts: DemoDebts,
  debtorId: string,
  creditorId: string,
  amount: number,
  names: Record<string, string>
): void {
  const pair = getDebtPair(debtorId, creditorId);
  const id = pair.join("_");
  const current = debts[id]?.amount ?? 0;
  debts[id] = {
    users: pair,
    names: { [debtorId]: names[debtorId], [creditorId]: names[creditorId] },
    amount: current + getPairAmountChange(pair, debtorId, amount),
  };
}
