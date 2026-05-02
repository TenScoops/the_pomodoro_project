import { useEffect } from "react";
import { useSessionStore } from "../../../store/sessionStore";
import { TimerMode } from "../types/timerTypes";

export default function useAdvanceBlockAfterRating(params: { mode: TimerMode; hasUserRated: boolean }) {
  const { mode, hasUserRated } = params;

  useEffect(() => {
    const store = useSessionStore.getState();
    if (mode === "work" && store.hasUserRated) {
      store.setHasUserRated(false);
      store.setBlockNum(store.blockNum + 1);
    }
  }, [mode, hasUserRated]);
}

