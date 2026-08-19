import { useCallback, useEffect, useState } from "react";
import { todayLocalISODate } from "../lib/calendarDates";
import {
  collectRecordedBlocksFromLocalStorage,
  collectRecordedBlocksFromSessions,
  pickPreviousBlockRating,
  type PreviousBlockRating,
} from "../lib/previousBlockRating";
import { getSessionsWithRatingsForDate } from "../services/pomoprogressService";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export type PreviousBlockRatingStatus = "loading" | "error" | "ready";

export interface UsePreviousBlockRatingResult {
  status: PreviousBlockRatingStatus;
  previousBlock: PreviousBlockRating | null;
}

export function usePreviousBlockRating(): UsePreviousBlockRatingResult {
  const { user, loading: authLoading } = useAuth();
  const blockNum = useSessionStore((state) => state.blockNum);
  const activeSupabaseSessionId = useSessionStore((state) => state.activeSupabaseSessionId);
  const chartDataRevision = useSessionStore((state) => state.chartDataRevision);

  const [status, setStatus] = useState<PreviousBlockRatingStatus>("loading");
  const [previousBlock, setPreviousBlock] = useState<PreviousBlockRating | null>(null);

  const reload = useCallback(() => {
    void chartDataRevision;
    if (authLoading) {
      return;
    }

    if (!user) {
      const recorded = collectRecordedBlocksFromLocalStorage();
      setPreviousBlock(pickPreviousBlockRating(recorded, blockNum, null));
      setStatus("ready");
      return;
    }

    void getSessionsWithRatingsForDate(todayLocalISODate()).then((result) => {
      if (result.error) {
        setPreviousBlock(null);
        setStatus("error");
        return;
      }
      const recorded = collectRecordedBlocksFromSessions(result.data);
      setPreviousBlock(pickPreviousBlockRating(recorded, blockNum, activeSupabaseSessionId));
      setStatus("ready");
    });
  }, [authLoading, user, blockNum, activeSupabaseSessionId, chartDataRevision]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { status, previousBlock };
}
