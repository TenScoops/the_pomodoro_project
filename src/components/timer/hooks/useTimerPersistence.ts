import type { MutableRefObject } from "react";
import { useCallback } from "react";
import { clearPersistedTimer, readPersistedTimer, writePersistedTimer } from "../../../lib/timerPersistence";
import { phaseEndFromDisplaySecondsRemaining, remainingDisplaySeconds, TIMER_SPEED_MULTIPLIER } from "../../../lib/timerSpeed";
import { useSessionStore } from "../../../store/sessionStore";
import { TimerMode } from "../types/timerTypes";

type TimerPersistenceSnapshot = {
  phaseEndAtMsRef: MutableRefObject<number | null>;
  timeLeftRef: MutableRefObject<number>;
  modeRef: MutableRefObject<TimerMode>;
  isPausedRef: MutableRefObject<boolean>;
  effectiveMultiplierRef: MutableRefObject<number>;
};

type TimerRestoreAppliers = {
  setSpeedBoostEnabled: (value: boolean) => void;
  setMode: (mode: TimerMode) => void;
  setIsPaused: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setPreviousMode: (mode: TimerMode) => void;
  onRestoredElapsedPhase: () => void;
};

export default function useTimerPersistence(params: {
  snapshot: TimerPersistenceSnapshot;
  workMinutes: number;
  numOfBreaks: number;
  breakMinutes: number;
}) {
  const { snapshot, workMinutes, numOfBreaks, breakMinutes } = params;

  const persistSnapshot = useCallback(() => {
    const store = useSessionStore.getState();
    if (store.sessionComplete) {
      return;
    }
    writePersistedTimer({
      version: 1,
      phaseEndAtMs: snapshot.phaseEndAtMsRef.current,
      timeLeftSeconds: snapshot.timeLeftRef.current,
      mode: snapshot.modeRef.current,
      isPaused: snapshot.isPausedRef.current,
      workMinutes,
      numOfBreaks,
      breakMinutes,
      blockNum: store.blockNum,
      hasUserRated: store.hasUserRated,
      speedMultiplier: snapshot.effectiveMultiplierRef.current,
    });
  }, [snapshot, workMinutes, numOfBreaks, breakMinutes]);

  const restoreIfCompatible = useCallback(
    (appliers: TimerRestoreAppliers): boolean => {
      const persisted = readPersistedTimer();
      const fingerprintOk =
        persisted &&
        persisted.workMinutes === workMinutes &&
        persisted.numOfBreaks === numOfBreaks &&
        persisted.breakMinutes === breakMinutes;

      if (!fingerprintOk || !persisted) {
        return false;
      }

      const store = useSessionStore.getState();
      const speed = persisted.speedMultiplier ?? TIMER_SPEED_MULTIPLIER;
      snapshot.effectiveMultiplierRef.current = speed;
      appliers.setSpeedBoostEnabled(speed !== TIMER_SPEED_MULTIPLIER);

      store.setBlockNum(persisted.blockNum);
      store.setHasUserRated(persisted.hasUserRated);

      appliers.setMode(persisted.mode);
      snapshot.modeRef.current = persisted.mode;
      appliers.setPreviousMode(persisted.mode);

      appliers.setIsPaused(persisted.isPaused);
      snapshot.isPausedRef.current = persisted.isPaused;

      if (!persisted.isPaused && persisted.phaseEndAtMs !== null) {
        const remaining = remainingDisplaySeconds(persisted.phaseEndAtMs, speed);
        snapshot.timeLeftRef.current = remaining;
        appliers.setTimeLeft(remaining);
        snapshot.phaseEndAtMsRef.current = phaseEndFromDisplaySecondsRemaining(remaining, speed);
        persistSnapshot();
        if (remaining <= 0) {
          appliers.onRestoredElapsedPhase();
        }
      } else {
        snapshot.timeLeftRef.current = persisted.timeLeftSeconds;
        appliers.setTimeLeft(persisted.timeLeftSeconds);
        snapshot.phaseEndAtMsRef.current = null;
        persistSnapshot();
      }

      return true;
    },
    [workMinutes, numOfBreaks, breakMinutes, snapshot, persistSnapshot]
  );

  return { persistSnapshot, restoreIfCompatible, clearPersistedTimer };
}

