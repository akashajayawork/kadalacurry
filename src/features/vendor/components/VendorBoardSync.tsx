import { useNow } from "@/hooks/useNow";
import type { Room } from "@/types";
import { formatDateId } from "@/utils/date";
import { getEnabledMeals } from "@/utils/meals";

import { useVendorBoardSync } from "../hooks/useVendorBoardSync";

type VendorBoardSyncProps = {
  room: Room;
};

/**
 * Keeps the room's public vendor board current while the app is open. Renders
 * nothing. Takes the room as a prop (rather than from the room context) so the
 * vendor feature, which the public vendor page imports, stays free of sign-in code.
 */
export function VendorBoardSync({ room }: VendorBoardSyncProps) {
  // Re-checks the date every minute, so the board moves on after midnight.
  const now = useNow();
  useVendorBoardSync(room.id, room.name, getEnabledMeals(room.meals).join(","), formatDateId(now));
  return null;
}
