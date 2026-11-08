import { useState } from "react";

import { useToast } from "@/components/feedback";
import { useRoom } from "@/features/rooms";
import { fetchAllSettlements } from "@/services/settlementService";

import { downloadPaymentHistoryPdf } from "../utils/paymentHistoryPdf";

export function usePaymentHistoryDownload() {
  const { roomId, room } = useRoom();
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);

    try {
      const settlements = await fetchAllSettlements(roomId);

      if (settlements.length === 0) {
        showToast("No settlements to download yet.");
        return;
      }

      await downloadPaymentHistoryPdf(settlements, room.name);
      showToast("Payment history downloaded", "success");
    } catch (error) {
      console.error("PDF export failed:", error);
      showToast("Couldn't create the PDF. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading };
}
