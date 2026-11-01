export function formatRupees(amount: number): string {
  const formatted = `₹${Math.abs(amount).toLocaleString("en-IN")}`;
  return amount < 0 ? `-${formatted}` : formatted;
}
