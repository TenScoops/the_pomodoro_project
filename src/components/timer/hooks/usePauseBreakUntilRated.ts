import { useEffect } from "react";
import { TimerMode } from "../types/timerTypes";

export default function usePauseBreakUntilRated(params: {
  mode: TimerMode;
  hasUserRated: boolean;
  isPaused: boolean;
  pauseFromClock: () => void;
}) {
  const { mode, hasUserRated, isPaused, pauseFromClock } = params;

  useEffect(() => {
    if (mode !== "break" || hasUserRated || isPaused) {
      return;
    }
    pauseFromClock();
  }, [mode, hasUserRated, isPaused, pauseFromClock]);
}

