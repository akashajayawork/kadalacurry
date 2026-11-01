import { useNow } from "@/hooks/useNow";
import { formatDateId } from "@/utils/date";

import { useVendorBoardSync } from "../hooks/useVendorBoardSync";

/** Keeps the public vendor board current while the app is open. Renders nothing. */
export function VendorBoardSync() {
  // Re-checks the date every minute, so the board moves on after midnight.
  const now = useNow();
  useVendorBoardSync(formatDateId(now));
  return null;
}
