import { useEffect, useState } from "react";

import { subscribeToRoommates } from "@/services/roommateService";
import type { Roommate } from "@/types";

export function useRoommates() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () =>
      subscribeToRoommates(
        (fetchedRoommates) => {
          setRoommates(fetchedRoommates);
          setError("");
          setLoading(false);
        },
        (snapshotError) => {
          console.error("Error loading roommate profiles:", snapshotError);
          setError(
            "Couldn't load roommate profiles. Check your Firestore rules and connection."
          );
          setLoading(false);
        }
      ),
    []
  );

  return { roommates, loading, error };
}
