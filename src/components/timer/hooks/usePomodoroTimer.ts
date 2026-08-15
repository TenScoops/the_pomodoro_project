import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { RUNTIME_SPEED_BOOST_MULTIPLIER, TIMER_SPEED_MULTIPLIER } from "../../../lib/timerSpeed";
import { useSessionStore } from "../../../store/sessionStore";
import useAdvanceBlockAfterRating from "./useAdvanceBlockAfterRating";
import useBlockCompleteToast from "./useBlockCompleteToast";
import usePauseBreakUntilRated from "./usePauseBreakUntilRated";
import usePomodoroTimerActions from "./usePomodoroTimerActions";
import useTimerDocumentTitle from "./useTimerDocumentTitle";
import useTimerInitialization from "./useTimerInitialization";
import useTimerPersistence from "./useTimerPersistence";
import useTimerTicking from "./useTimerTicking";
import { TimerMode, UsePomodoroTimerResult } from "../types/timerTypes";
import { computeCompletedWorkSeconds, computeWorkBlockSeconds } from "../utils/timerMath";

export default function usePomodoroTimer(): UsePomodoroTimerResult {
  const { numOfBreaks, breakMinutes, workMinutes, sessionComplete, setShowTimerPage, setIsWorkGreater, blockNum, hasUserRated, skippedBlockNumbers } =
    useSessionStore(
      useShallow((s) => ({
        numOfBreaks: s.numOfBreaks,
        breakMinutes: s.breakMinutes,
        workMinutes: s.workMinutes,
        sessionComplete: s.sessionComplete,
        setShowTimerPage: s.setShowTimerPage,
        setIsWorkGreater: s.setIsWorkGreater,
        blockNum: s.blockNum,
        hasUserRated: s.hasUserRated,
        skippedBlockNumbers: s.skippedBlockNumbers,
      }))
    );

  const [isPaused, setIsPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState<TimerMode>("work");

  const timeLeftRef = useRef(timeLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef<TimerMode>(mode);
  const phaseEndAtMsRef = useRef<number | null>(null);
  const hasInitializedTimerRef = useRef(false);

  const [speedBoostEnabled, setSpeedBoostEnabled] = useState(false);
  const effectiveMultiplier = speedBoostEnabled ? RUNTIME_SPEED_BOOST_MULTIPLIER : TIMER_SPEED_MULTIPLIER;
  const effectiveMultiplierRef = useRef(effectiveMultiplier);
  effectiveMultiplierRef.current = effectiveMultiplier;

  const totalBreakTimeMinutes = numOfBreaks * breakMinutes;
  const totalBlocks = numOfBreaks + 1;
  const totalWorkTimeMinutes = workMinutes * 60 - totalBreakTimeMinutes;

  useEffect(() => {
    setIsWorkGreater(totalWorkTimeMinutes > totalBreakTimeMinutes);
  }, [totalWorkTimeMinutes, totalBreakTimeMinutes, setIsWorkGreater]);

  useEffect(() => {
    if (!sessionComplete) {
      return;
    }
    setShowTimerPage(false);
  }, [sessionComplete, setShowTimerPage]);

  const persistence = useTimerPersistence();

  const {
    applyTimeLeft,
    pauseFromClock,
    resumeTimer,
    switchMode,
    toggleSpeedBoost,
    skipBreak,
    resetCurrentPhase,
  } =
    usePomodoroTimerActions({
      refs: { timeLeftRef, isPausedRef, modeRef, phaseEndAtMsRef, effectiveMultiplierRef },
      setters: {
        setTimeLeft,
        setIsPaused,
        setMode,
        setSpeedBoostEnabled,
      },
      inputs: { workMinutes, breakMinutes, totalBreakTimeMinutes, totalBlocks },
      persistSnapshot: persistence.persistSnapshot,
    });

  useEffect(() => {
    if (sessionComplete) {
      persistence.clearPersistedTimer();
    }
  }, [persistence, sessionComplete]);

  useTimerInitialization({
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
  });

  const { showBlockCompleteToast, toastBlockNumber, dismissBlockCompleteToast } = useBlockCompleteToast(mode);

  useTimerTicking({
    isPausedRef,
    phaseEndAtMsRef,
    effectiveMultiplierRef,
    timeLeftRef,
    setTimeLeft,
    persistSnapshot: persistence.persistSnapshot,
    onElapsed: () => switchMode(),
    deps: [workMinutes, numOfBreaks, breakMinutes, speedBoostEnabled],
  });

  usePauseBreakUntilRated({ mode, hasUserRated, isPaused, pauseFromClock });
  useAdvanceBlockAfterRating({ mode, hasUserRated });

  const safeTimeLeftSeconds = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTimeLeftSeconds / 60);
  const seconds = Math.floor(safeTimeLeftSeconds % 60);
  const workBlockSeconds = computeWorkBlockSeconds({ workMinutes, totalBreakTimeMinutes, totalBlocks });
  const phaseDurationSeconds = mode === "break" ? breakMinutes * 60 : workBlockSeconds;
  const phaseProgressRatio =
    phaseDurationSeconds > 0 ? Math.min(1, Math.max(0, 1 - safeTimeLeftSeconds / phaseDurationSeconds)) : 0;
  const currentWorkBlockIndex = Math.min(totalBlocks, Math.max(1, blockNum));
  const elapsedWorkSeconds = computeCompletedWorkSeconds({
    mode,
    currentWorkBlockIndex,
    timeLeftSeconds: safeTimeLeftSeconds,
    workBlockSeconds,
    skippedBlockNumbers: [],
  });
  const completedWorkSeconds = computeCompletedWorkSeconds({
    mode,
    currentWorkBlockIndex,
    timeLeftSeconds: safeTimeLeftSeconds,
    workBlockSeconds,
    skippedBlockNumbers,
  });
  const completedWorkMinutes = Math.min(totalWorkTimeMinutes, completedWorkSeconds / 60);
  const remainingWorkMinutes = Math.max(0, totalWorkTimeMinutes - elapsedWorkSeconds / 60);
  const completedBlocks = mode === "break" ? currentWorkBlockIndex : Math.max(0, currentWorkBlockIndex - 1);

  useTimerDocumentTitle({
    sessionComplete,
    safeTimeLeftSeconds,
    mode,
    isPaused,
    totalWorkTimeMinutes,
    totalBreakTimeMinutes,
    currentWorkBlockIndex,
    totalBlocks,
  });

  const speedBoostTitle = speedBoostEnabled
    ? "Return to normal speed"
    : `Speed up ${RUNTIME_SPEED_BOOST_MULTIPLIER}× (display time)`;
  const speedBoostLabel = speedBoostEnabled ? "1×" : `${RUNTIME_SPEED_BOOST_MULTIPLIER}×`;

  return {
    isPaused,
    mode,
    minutes,
    seconds,
    phaseProgressRatio,
    totalBreakTimeMinutes,
    totalWorkTimeMinutes,
    totalBlocks,
    currentWorkBlockIndex,
    completedWorkMinutes,
    remainingWorkMinutes,
    completedBlocks,
    breakLengthMinutes: breakMinutes,
    effectiveMultiplier,
    speedBoostEnabled,
    speedBoostTitle,
    speedBoostLabel,
    showBlockCompleteToast,
    toastBlockNumber,
    dismissBlockCompleteToast,
    pauseFromClock,
    resumeTimer,
    toggleSpeedBoost,
    skipBreak,
    resetCurrentPhase,
  };
}

