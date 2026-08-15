import type { MutableRefObject } from "react";
import { useEffect } from "react";
import { TimerMode } from "../types/timerTypes";
import { computeWorkBlockSeconds } from "../utils/timerMath";

type PersistenceApi = {
  clearPersistedTimer: () => void;
};

export default function useTimerInitialization(params: {
  workMinutes: number;
  numOfBreaks: number;
  breakMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
  mode: TimerMode;
  applyTimeLeft: (rawSeconds: number) => void;
  phaseEndAtMsRef: MutableRefObject<number | null>;
  hasInitializedTimerRef: MutableRefObject<boolean>;
  persistence: PersistenceApi;
}) {
  const {
    workMinutes,
    numOfBreaks,
    breakMinutes,
    totalBreakTimeMinutes,
    totalBlocks,
    mode,
    applyTimeLeft,
    phaseEndAtMsRef,
    hasInitializedTimerRef,
    persistence,
  } = params;

  useEffect(() => {
    const setDefaultPhase = () => {
      const workBlockSeconds = computeWorkBlockSeconds({ workMinutes, totalBreakTimeMinutes, totalBlocks });
      phaseEndAtMsRef.current = null;
      applyTimeLeft(mode === "break" ? breakMinutes * 60 : workBlockSeconds);
    };

    hasInitializedTimerRef.current = true;
    persistence.clearPersistedTimer();
    setDefaultPhase();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);
}
