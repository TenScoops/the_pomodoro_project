import type { MutableRefObject } from "react";
import { useCallback } from "react";
import { playTimerPhaseCompleteSound } from "../../../lib/timerSounds";
import {
  phaseEndFromDisplaySecondsRemaining,
  remainingDisplaySeconds,
  RUNTIME_SPEED_BOOST_MULTIPLIER,
  TIMER_SPEED_MULTIPLIER,
} from "../../../lib/timerSpeed";
import { TimerMode } from "../types/timerTypes";
import { computeNextPhaseSeconds, computeWorkBlockSeconds } from "../utils/timerMath";

type TimerRefs = {
  timeLeftRef: MutableRefObject<number>;
  isPausedRef: MutableRefObject<boolean>;
  modeRef: MutableRefObject<TimerMode>;
  phaseEndAtMsRef: MutableRefObject<number | null>;
  effectiveMultiplierRef: MutableRefObject<number>;
};

type TimerSetters = {
  setTimeLeft: (value: number) => void;
  setIsPaused: (value: boolean) => void;
  setMode: (value: TimerMode) => void;
  setSpeedBoostEnabled: (updater: (prev: boolean) => boolean) => void;
};

type TimerInputs = {
  workMinutes: number;
  breakMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
};

export default function usePomodoroTimerActions(params: {
  refs: TimerRefs;
  setters: TimerSetters;
  inputs: TimerInputs;
  persistSnapshot: () => void;
}) {
  const { refs, setters, inputs, persistSnapshot } = params;

  const applyTimeLeft = useCallback(
    (rawSeconds: number) => {
      const next = Math.max(0, Math.round(rawSeconds));
      refs.timeLeftRef.current = next;
      setters.setTimeLeft(next);

      if (!refs.isPausedRef.current) {
        refs.phaseEndAtMsRef.current = phaseEndFromDisplaySecondsRemaining(next, refs.effectiveMultiplierRef.current);
      } else {
        refs.phaseEndAtMsRef.current = null;
      }

      persistSnapshot();
    },
    [persistSnapshot, refs, setters]
  );

  const pauseFromClock = useCallback(() => {
    let nextRemaining: number;
    if (refs.phaseEndAtMsRef.current !== null) {
      nextRemaining = remainingDisplaySeconds(refs.phaseEndAtMsRef.current, refs.effectiveMultiplierRef.current);
      if (nextRemaining === 0 && refs.timeLeftRef.current > 0 && refs.phaseEndAtMsRef.current > Date.now()) {
        nextRemaining = refs.timeLeftRef.current;
      }
    } else {
      nextRemaining = refs.timeLeftRef.current;
    }

    refs.timeLeftRef.current = nextRemaining;
    setters.setTimeLeft(nextRemaining);
    refs.phaseEndAtMsRef.current = null;
    refs.isPausedRef.current = true;
    setters.setIsPaused(true);
    persistSnapshot();
  }, [persistSnapshot, refs, setters]);

  const resumeTimer = useCallback(() => {
    refs.isPausedRef.current = false;
    setters.setIsPaused(false);
    refs.phaseEndAtMsRef.current = phaseEndFromDisplaySecondsRemaining(refs.timeLeftRef.current, refs.effectiveMultiplierRef.current);
    persistSnapshot();
  }, [persistSnapshot, refs, setters]);

  const switchMode = useCallback(
    (options?: { silent?: boolean }) => {
      const previousMode = refs.modeRef.current;
      const nextMode: TimerMode = previousMode === "work" ? "break" : "work";
      const nextTimeRaw = computeNextPhaseSeconds({
        nextMode,
        workMinutes: inputs.workMinutes,
        totalBreakTimeMinutes: inputs.totalBreakTimeMinutes,
        totalBlocks: inputs.totalBlocks,
        breakMinutes: inputs.breakMinutes,
      });

      if (!options?.silent) {
        playTimerPhaseCompleteSound(previousMode);
      }

      if (previousMode === "break" && nextMode === "work") {
        refs.isPausedRef.current = true;
        setters.setIsPaused(true);
      }

      setters.setMode(nextMode);
      refs.modeRef.current = nextMode;
      applyTimeLeft(nextTimeRaw);
    },
    [applyTimeLeft, inputs.breakMinutes, inputs.totalBlocks, inputs.totalBreakTimeMinutes, inputs.workMinutes, refs, setters]
  );

  const switchModeAfterRestore = useCallback(() => {
    switchMode({ silent: true });
  }, [switchMode]);

  const toggleSpeedBoost = useCallback(() => {
    setters.setSpeedBoostEnabled((previous) => {
      const next = !previous;
      const nextMult = next ? RUNTIME_SPEED_BOOST_MULTIPLIER : TIMER_SPEED_MULTIPLIER;
      refs.effectiveMultiplierRef.current = nextMult;
      if (!refs.isPausedRef.current && refs.phaseEndAtMsRef.current !== null) {
        refs.phaseEndAtMsRef.current = phaseEndFromDisplaySecondsRemaining(refs.timeLeftRef.current, nextMult);
      }
      queueMicrotask(() => persistSnapshot());
      return next;
    });
  }, [persistSnapshot, refs, setters]);

  const skipBreak = useCallback(() => {
    const workBlockSeconds = computeWorkBlockSeconds({
      workMinutes: inputs.workMinutes,
      totalBreakTimeMinutes: inputs.totalBreakTimeMinutes,
      totalBlocks: inputs.totalBlocks,
    });
    setters.setMode("work");
    refs.modeRef.current = "work";
    applyTimeLeft(workBlockSeconds);
  }, [applyTimeLeft, inputs, refs, setters]);

  return { applyTimeLeft, pauseFromClock, resumeTimer, switchMode, switchModeAfterRestore, toggleSpeedBoost, skipBreak };
}

