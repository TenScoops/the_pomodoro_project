import type { MutableRefObject } from "react";
import { useEffect } from "react";
import { TimerMode } from "../types/timerTypes";
import { computeWorkBlockSeconds } from "../utils/timerMath";

type PersistenceApi = {
  clearPersistedTimer: () => void;
  restoreIfCompatible: (appliers: {
    setSpeedBoostEnabled: (value: boolean) => void;
    setMode: (mode: TimerMode) => void;
    setIsPaused: (value: boolean) => void;
    setTimeLeft: (value: number) => void;
    setPreviousMode: (mode: TimerMode) => void;
    onRestoredElapsedPhase: () => void;
  }) => boolean;
};

export default function useTimerInitialization(params: {
  workMinutes: number;
  numOfBreaks: number;
  breakMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
  mode: TimerMode;
  setSpeedBoostEnabled: (value: boolean) => void;
  setMode: (mode: TimerMode) => void;
  setIsPaused: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  applyTimeLeft: (rawSeconds: number) => void;
  switchModeAfterRestore: () => void;
  modeRef: MutableRefObject<TimerMode>;
  isPausedRef: MutableRefObject<boolean>;
  timeLeftRef: MutableRefObject<number>;
  phaseEndAtMsRef: MutableRefObject<number | null>;
  previousModeRef: MutableRefObject<TimerMode>;
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
    setSpeedBoostEnabled,
    setMode,
    setIsPaused,
    setTimeLeft,
    applyTimeLeft,
    switchModeAfterRestore,
    modeRef,
    isPausedRef,
    timeLeftRef,
    phaseEndAtMsRef,
    previousModeRef,
    hasInitializedTimerRef,
    persistence,
  } = params;

  useEffect(() => {
    const setDefaultPhase = () => {
      const workBlockSeconds = computeWorkBlockSeconds({ workMinutes, totalBreakTimeMinutes, totalBlocks });
      phaseEndAtMsRef.current = null;
      applyTimeLeft(mode === "break" ? breakMinutes * 60 : workBlockSeconds);
    };

    if (hasInitializedTimerRef.current) {
      persistence.clearPersistedTimer();
      setDefaultPhase();
      return;
    }

    hasInitializedTimerRef.current = true;
    const restored = persistence.restoreIfCompatible({
      setSpeedBoostEnabled,
      setMode: (nextMode) => {
        setMode(nextMode);
        modeRef.current = nextMode;
      },
      setPreviousMode: (nextMode) => {
        previousModeRef.current = nextMode;
      },
      setIsPaused: (paused) => {
        setIsPaused(paused);
        isPausedRef.current = paused;
      },
      setTimeLeft: (seconds) => {
        setTimeLeft(seconds);
        timeLeftRef.current = seconds;
      },
      onRestoredElapsedPhase: () => window.setTimeout(switchModeAfterRestore, 0),
    });

    if (!restored) {
      persistence.clearPersistedTimer();
      setDefaultPhase();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);
}

