import { useCallback } from "react";
import { clearPersistedTimer } from "../../../lib/timerPersistence";

/**
 * Closing or refreshing the page must restart the timer. We keep this hook so tick/pause
 * call sites stay the same, but we never write or restore countdown state.
 */
export default function useTimerPersistence() {
  const persistSnapshot = useCallback(() => {
    /* intentionally empty — a reload always starts a new run */
  }, []);

  return { persistSnapshot, clearPersistedTimer };
}
