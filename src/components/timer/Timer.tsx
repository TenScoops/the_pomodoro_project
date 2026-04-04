import React, { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Areyousure from "./Areyousure";
import Skip from "../buttons/Skip";
import "./Timer.css";
import BlockCompleteToast from "../notifications/BlockCompleteToast";
import Rating from "../rating/Rating";
import { clearPersistedTimer, readPersistedTimer, writePersistedTimer } from "../../lib/timerPersistence";
import { playTimerPhaseCompleteSound } from "../../lib/timerSounds";
import {
  RUNTIME_SPEED_BOOST_MULTIPLIER,
  TIMER_SPEED_MULTIPLIER,
  phaseEndFromDisplaySecondsRemaining,
  remainingDisplaySeconds,
  timerTickIntervalMs,
} from "../../lib/timerSpeed";
import { finalizeActivePomodoroSession } from "../../services/pomoprogressService";
import { useSessionStore } from "../../store/sessionStore";

type TimerMode = "work" | "break";

/** Matches `public/index.html` — restored when the timer unmounts or the session ends. */
const DEFAULT_DOCUMENT_TITLE = "The Progress Pomodoro";

const Timer = () => {
  const {
    numOfBreaks,
    breakMinutes,
    workMinutes,
    sessionComplete,
    setShowTimerPage,
    setIsWorkGreater,
    blockNum,
    hasUserRated,
    showData,
    showButtons,
    showClock,
    setClicked,
    setCancelTheSession,
    cancelTheSession,
  } = useSessionStore(
    useShallow((s) => ({
      numOfBreaks: s.numOfBreaks,
      breakMinutes: s.breakMinutes,
      workMinutes: s.workMinutes,
      sessionComplete: s.sessionComplete,
      setShowTimerPage: s.setShowTimerPage,
      setIsWorkGreater: s.setIsWorkGreater,
      blockNum: s.blockNum,
      hasUserRated: s.hasUserRated,
      showData: s.showData,
      showButtons: s.showButtons,
      showClock: s.showClock,
      setClicked: s.setClicked,
      setCancelTheSession: s.setCancelTheSession,
      cancelTheSession: s.cancelTheSession,
    }))
  );

  const [isPaused, setIsPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  /** Always start a session in work — the old `""` state displayed as "on break" and broke `switchMode` toggling. */
  const [mode, setMode] = useState<TimerMode>("work");

  const timeLeftRef = useRef(timeLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef<TimerMode>(mode);
  /** While running (not paused), phase ends at this UTC ms — survives background tab throttling. */
  const phaseEndAtRef = useRef<number | null>(null);
  const previousModeRef = useRef<TimerMode>(mode);
  const hasInitializedTimerRef = useRef(false);

  const [showBlockCompleteToast, setShowBlockCompleteToast] = useState(false);
  const [toastBlockNumber, setToastBlockNumber] = useState(1);
  /** When true, effective speed is `RUNTIME_SPEED_BOOST_MULTIPLIER` × base env multiplier; toggle is next to Start. */
  const [speedBoostEnabled, setSpeedBoostEnabled] = useState(false);
  const effectiveMultiplier = speedBoostEnabled ? RUNTIME_SPEED_BOOST_MULTIPLIER : TIMER_SPEED_MULTIPLIER;
  const effectiveMultiplierRef = useRef(effectiveMultiplier);
  effectiveMultiplierRef.current = effectiveMultiplier;

  const dismissBlockCompleteToast = useCallback(() => {
    setShowBlockCompleteToast(false);
  }, []);

  const totalBreakTime = numOfBreaks * breakMinutes;
  const numOfblocks = numOfBreaks + 1;
  const totalWorkTime = workMinutes * 60 - totalBreakTime;

  useEffect(() => {
    if (totalWorkTime <= totalBreakTime) {
      setIsWorkGreater(false);
    } else {
      setIsWorkGreater(true);
    }
  }, [totalWorkTime, totalBreakTime, setIsWorkGreater]);

  useEffect(() => {
    if (sessionComplete) {
      clearPersistedTimer();
      setShowTimerPage(false);
    }
  }, [sessionComplete, setShowTimerPage]);

  const blockNumRef = useRef(blockNum);
  const [block] = useState(0);
  const blockRef = useRef(block);

  useEffect(() => {
    blockNumRef.current = blockNum;
  }, [blockNum]);

  /** When the work timer hits zero we go to break — that is one finished work block. */
  useEffect(() => {
    const previousMode = previousModeRef.current;
    previousModeRef.current = mode;

    if (previousMode === "work" && mode === "break") {
      setToastBlockNumber(useSessionStore.getState().blockNum);
      setShowBlockCompleteToast(true);
    }
  }, [mode]);

  const persistSnapshot = useCallback(() => {
    const store = useSessionStore.getState();
    if (store.sessionComplete) {
      return;
    }
    writePersistedTimer({
      version: 1,
      phaseEndAtMs: phaseEndAtRef.current,
      timeLeftSeconds: timeLeftRef.current,
      mode: modeRef.current,
      isPaused: isPausedRef.current,
      workMinutes,
      numOfBreaks,
      breakMinutes,
      blockNum: store.blockNum,
      hasUserRated: store.hasUserRated,
      speedMultiplier: effectiveMultiplierRef.current,
    });
  }, [workMinutes, numOfBreaks, breakMinutes]);

  /**
   * Single place to update countdown: integer seconds, clamped at 0.
   * When not paused, `phaseEndAtRef` is set from wall clock so the timer stays accurate in background tabs.
   */
  const applyTimeLeft = useCallback(
    (rawSeconds: number) => {
      const next = Math.max(0, Math.round(rawSeconds));
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (!isPausedRef.current) {
        phaseEndAtRef.current = phaseEndFromDisplaySecondsRemaining(next, effectiveMultiplierRef.current);
      } else {
        phaseEndAtRef.current = null;
      }
      persistSnapshot();
    },
    [persistSnapshot]
  );

  const pauseFromClock = useCallback(() => {
    let nextRemaining: number;
    if (phaseEndAtRef.current !== null) {
      // Same formula as the interval (`remainingDisplaySeconds`); display seconds use the speed multiplier vs wall time.
      nextRemaining = remainingDisplaySeconds(phaseEndAtRef.current, effectiveMultiplierRef.current);
      // `Math.round` can yield 0 while the phase end is still in the future and the last tick still showed time — don't snap the UI to 0.
      if (nextRemaining === 0 && timeLeftRef.current > 0 && phaseEndAtRef.current > Date.now()) {
        nextRemaining = timeLeftRef.current;
      }
    } else {
      // Running paused state should always have a phase end; if not, keep the number already on screen.
      nextRemaining = timeLeftRef.current;
    }
    timeLeftRef.current = nextRemaining;
    setTimeLeft(nextRemaining);
    phaseEndAtRef.current = null;
    isPausedRef.current = true;
    setIsPaused(true);
    persistSnapshot();
  }, [persistSnapshot]);

  const resumeTimer = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    phaseEndAtRef.current = phaseEndFromDisplaySecondsRemaining(timeLeftRef.current, effectiveMultiplierRef.current);
    persistSnapshot();
  }, [persistSnapshot]);

  const toggleSpeedBoost = useCallback(() => {
    setSpeedBoostEnabled((previous) => {
      const next = !previous;
      const nextMult = next ? RUNTIME_SPEED_BOOST_MULTIPLIER : TIMER_SPEED_MULTIPLIER;
      effectiveMultiplierRef.current = nextMult;
      if (!isPausedRef.current && phaseEndAtRef.current !== null) {
        phaseEndAtRef.current = phaseEndFromDisplaySecondsRemaining(timeLeftRef.current, nextMult);
      }
      queueMicrotask(() => persistSnapshot());
      return next;
    });
  }, [persistSnapshot]);

  function initiateTimer() {
    const workBlockSeconds = ((workMinutes * 60 - totalBreakTime) / numOfblocks) * 60;
    phaseEndAtRef.current = null;
    if (mode === "break") {
      applyTimeLeft(breakMinutes * 60);
    } else {
      applyTimeLeft(workBlockSeconds);
    }
  }

  function applyRestore(persisted: NonNullable<ReturnType<typeof readPersistedTimer>>) {
    const store = useSessionStore.getState();
    const speed = persisted.speedMultiplier ?? TIMER_SPEED_MULTIPLIER;
    effectiveMultiplierRef.current = speed;
    setSpeedBoostEnabled(speed === RUNTIME_SPEED_BOOST_MULTIPLIER);

    store.setBlockNum(persisted.blockNum);
    store.setHasUserRated(persisted.hasUserRated);

    setMode(persisted.mode);
    modeRef.current = persisted.mode;
    previousModeRef.current = persisted.mode;

    setIsPaused(persisted.isPaused);
    isPausedRef.current = persisted.isPaused;

    if (!persisted.isPaused && persisted.phaseEndAtMs !== null) {
      const remaining = remainingDisplaySeconds(persisted.phaseEndAtMs, speed);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      phaseEndAtRef.current = phaseEndFromDisplaySecondsRemaining(remaining, speed);
      persistSnapshot();
      if (remaining <= 0) {
        window.setTimeout(() => switchModeAfterRestore(), 0);
      }
    } else {
      timeLeftRef.current = persisted.timeLeftSeconds;
      setTimeLeft(persisted.timeLeftSeconds);
      phaseEndAtRef.current = null;
      persistSnapshot();
    }
  }

  function switchMode(options?: { silent?: boolean }) {
    const previousMode = modeRef.current;
    const nextMode: TimerMode = previousMode === "work" ? "break" : "work";
    const nextTimeRaw =
      60 * (nextMode === "work" ? (60 * workMinutes - totalBreakTime) / numOfblocks : breakMinutes);

    if (!options?.silent) {
      playTimerPhaseCompleteSound(previousMode);
    }

    // When the break countdown hits zero, show the next work block but stay paused until the user presses Start.
    const pauseWorkUntilUserStarts = previousMode === "break" && nextMode === "work";
    if (pauseWorkUntilUserStarts) {
      isPausedRef.current = true;
      setIsPaused(true);
    }

    setMode(nextMode);
    modeRef.current = nextMode;
    applyTimeLeft(nextTimeRaw);
  }

  /** Used only when restore finds the phase already elapsed (e.g. long absence). */
  function switchModeAfterRestore() {
    switchMode({ silent: true });
  }

  useEffect(() => {
    if (!hasInitializedTimerRef.current) {
      hasInitializedTimerRef.current = true;
      const persisted = readPersistedTimer();
      const fingerprintOk =
        persisted &&
        persisted.workMinutes === workMinutes &&
        persisted.numOfBreaks === numOfBreaks &&
        persisted.breakMinutes === breakMinutes;

      if (fingerprintOk && persisted) {
        applyRestore(persisted);
        return;
      }

      clearPersistedTimer();
      initiateTimer();
      return;
    }

    clearPersistedTimer();
    initiateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (isPausedRef.current || phaseEndAtRef.current === null) {
        return;
      }
      const remaining = remainingDisplaySeconds(phaseEndAtRef.current, effectiveMultiplierRef.current);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      persistSnapshot();
      if (remaining <= 0) {
        switchMode();
      }
    }, timerTickIntervalMs(effectiveMultiplierRef.current));

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes, speedBoostEnabled]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (isPausedRef.current || phaseEndAtRef.current === null) {
        return;
      }
      const remaining = remainingDisplaySeconds(phaseEndAtRef.current, effectiveMultiplierRef.current);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      persistSnapshot();
      if (remaining <= 0) {
        switchMode();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes, speedBoostEnabled]);

  useEffect(() => {
    const onPageHide = () => {
      persistSnapshot();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [persistSnapshot]);

  /**
   * While a break is waiting for a rating, keep the countdown frozen (resume is immediately paused again).
   * This must not depend on `isPaused` alone — doing so re-ran `pauseFromClock` when pausing *work* and could corrupt the displayed time.
   */
  useEffect(() => {
    if (mode !== "break" || hasUserRated || isPaused) {
      return;
    }
    pauseFromClock();
  }, [mode, hasUserRated, isPaused, pauseFromClock]);

  useEffect(() => {
    const store = useSessionStore.getState();

    if (mode === "work" && store.hasUserRated) {
      store.setHasUserRated(false);
      blockRef.current += 1;
      blockNumRef.current += blockRef.current;
      const next = store.blockNum + blockRef.current;
      store.setBlockNum(next);
      blockRef.current = 0;
    }

    const latest = useSessionStore.getState();
    /**
     * Last work block → `break` is the rating window for that block. We must NOT finalize here
     * until `hasUserRated` is true; otherwise we complete the session before the rating modal can run.
     */
    const isFinalRatingBreak =
      latest.blockNum === numOfblocks &&
      mode === "break" &&
      latest.hasUserRated &&
      !latest.sessionComplete;

    if (isFinalRatingBreak) {
      void finalizeActivePomodoroSession().then((result) => {
        if (result.error) {
          console.error("Failed to finalize session on the server", result.error);
          return;
        }
        const storeAfter = useSessionStore.getState();
        storeAfter.setSessionComplete(true);
        storeAfter.setBlockNum(0);
        storeAfter.setHasUserRated(false);
      });
    }
  }, [mode, numOfblocks, hasUserRated]);

  const safeTimeLeft = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTimeLeft / 60);
  const seconds = Math.floor(safeTimeLeft % 60);

  /** Session end sets `blockNum` to 0; new runs must reset to 1 from Setter/Finished. This caps display so we never show 0/N while working. */
  const currentWorkBlockIndex = Math.min(numOfblocks, Math.max(1, blockNum));

  const addZero = (value: number) => {
    const safe = Math.max(0, value);
    return safe < 10 ? "0" + safe : String(safe);
  };

  useEffect(() => {
    if (sessionComplete) {
      document.title = DEFAULT_DOCUMENT_TITLE;
      return () => {
        document.title = DEFAULT_DOCUMENT_TITLE;
      };
    }

    const minutesPart = Math.floor(safeTimeLeft / 60);
    const secondsPart = Math.floor(safeTimeLeft % 60);
    const timeStr =
      totalWorkTime < totalBreakTime
        ? "00:00"
        : `${String(minutesPart).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")}`;
    const phaseLabel = mode === "break" ? "Break" : "Work";
    const pauseLabel = isPaused ? " · Paused" : "";
    const blockLabel = mode === "work" ? ` · ${currentWorkBlockIndex}/${numOfblocks}` : "";

    document.title = `${timeStr} · ${phaseLabel}${blockLabel}${pauseLabel} · ${DEFAULT_DOCUMENT_TITLE}`;

    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [
    sessionComplete,
    safeTimeLeft,
    mode,
    isPaused,
    totalWorkTime,
    totalBreakTime,
    currentWorkBlockIndex,
    numOfblocks,
  ]);

  const showTheButtons = () => {
    if (showButtons === true) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <div
            className="timer-control-row"
            style={{ marginBottom: "30px", display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "12px" }}
          >
            {isPaused ? (
              <button className="play" type="button" onClick={() => resumeTimer()}>
                Start
              </button>
            ) : (
              <button className="pause" type="button" onClick={() => pauseFromClock()}>
                Pause
              </button>
            )}
            <button
              className="speedBoost"
              type="button"
              title={speedBoostEnabled ? "Return to normal speed" : `Speed up ${RUNTIME_SPEED_BOOST_MULTIPLIER}× (display time)`}
              onClick={() => toggleSpeedBoost()}
            >
              {speedBoostEnabled ? "1×" : `${RUNTIME_SPEED_BOOST_MULTIPLIER}×`}
            </button>
            {mode === "break" ? (
              <Skip
                title="Skip Break"
                onClick={() => {
                  const workBlockSeconds = ((workMinutes * 60 - totalBreakTime) / numOfblocks) * 60;
                  setMode("work");
                  modeRef.current = "work";
                  applyTimeLeft(workBlockSeconds);
                }}
              />
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button
              className="cancel"
              style={{ width: "150px", height: "25px", marginLeft: "55px", borderRadius: "12px" }}
              type="button"
              onClick={() => {
                setClicked(false);
                setCancelTheSession(true);
              }}
            >
              Cancel Session
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const showRating = () => {
    if (mode === "break") {
      return <Rating />;
    }
    return null;
  };

  return (
    <div className="timer">
      <div className="showUserData" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        {showData ? (
          <div className="blockdiv">
            <p>&nbsp;Your session &nbsp;</p>
          </div>
        ) : null}
        {showData ? (
          <div className="blockdiv">
            <p>&nbsp;Will have {totalWorkTime} minutes of worktime&nbsp;</p>
          </div>
        ) : null}
        {showData ? (
          <div className="blockdiv">
            <p>&nbsp;And {totalBreakTime} minutes of breaktime&nbsp;</p>
          </div>
        ) : null}
        {showData ? (
          <div style={{ marginLeft: "15px" }} className="blockdiv">
            <p style={{ color: "black", backgroundColor: "white" }}>&nbsp;Session will be completed in {numOfblocks} block(s)&nbsp;</p>
          </div>
        ) : null}
        {showData ? (
          <div className="blockdiv">
            <p>
              &nbsp;With {addZero(minutes)}:{addZero(seconds)} minutes per block&nbsp;
            </p>
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {showClock && (
          <div style={{ borderRadius: "10px" }} className="blockdiv2">
            <p>&nbsp;You are currently: {mode === "break" ? "on break." : "working.."}&nbsp;</p>
          </div>
        )}
      </div>

      {mode === "work" && (
        <div style={{ borderRadius: "10px", marginBottom: "20px" }} className="blockdiv2">
          <p>
            &nbsp;Block #{currentWorkBlockIndex}/{numOfblocks}&nbsp;
          </p>
        </div>
      )}

      {showClock && (
        <div className="timediv">
          <div className={showButtons ? "time" : "time + new-font"}>
            <p style={{ marginLeft: "20px" }} className="minutes">
              {totalWorkTime < totalBreakTime ? "00" : addZero(minutes)}
            </p>
            <p className="semicolon">:</p>
            <p style={{ marginRight: "20px" }} className="seconds">
              {totalWorkTime < totalBreakTime ? "00" : addZero(seconds)}
            </p>
          </div>
        </div>
      )}

      {showClock && effectiveMultiplier > 1 && (
        <div style={{ borderRadius: "10px", marginTop: "8px" }} className="blockdiv2">
          <p style={{ fontSize: "15px" }}>&nbsp;Speed ×{effectiveMultiplier}&nbsp;</p>
        </div>
      )}

      {showClock && <div className="timerbuttons">{showButtons ? showTheButtons() : null}</div>}

      {totalWorkTime < totalBreakTime && (
        <div className="blockdiv" style={{ backgroundColor: "white", color: "darkred" }}>
          <p>Worktime cannot be less than your breaktime.</p>
        </div>
      )}

      {showRating()}
      {cancelTheSession ? <Areyousure /> : null}

      <BlockCompleteToast
        show={showBlockCompleteToast}
        blockNumber={toastBlockNumber}
        totalBlocks={numOfblocks}
        onDismiss={dismissBlockCompleteToast}
      />
    </div>
  );
};

export default Timer;
