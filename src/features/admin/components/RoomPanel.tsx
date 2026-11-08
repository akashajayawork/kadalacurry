import { useRoom } from "@/features/rooms";
import type { JoinRequest } from "@/types";

import { JoinRequestList } from "./JoinRequestList";
import { MealPricesForm } from "./MealPricesForm";
import { MemberList } from "./MemberList";
import { RoomInfo } from "./RoomInfo";
import { VendorPaymentForm } from "./VendorPaymentForm";
import "../admin.css";

type RoomPanelProps = {
  /** People waiting to join (empty unless you're the room admin). */
  requests: JoinRequest[];
};

/**
 * The room part of the account sheet. Everyone sees the room and its links;
 * the room admin also approves people, removes them and sets up meals,
 * prices and the vendor's UPI, all in this one place. Each of those opens and
 * closes, so the sheet stays short.
 */
export function RoomPanel({ requests }: RoomPanelProps) {
  const { isRoomAdmin } = useRoom();

  return (
    <div className="room-panel">
      <RoomInfo />
      {isRoomAdmin && (
        <>
          <JoinRequestList requests={requests} />
          <MemberList />
          <MealPricesForm />
          <VendorPaymentForm />
        </>
      )}
    </div>
  );
}
