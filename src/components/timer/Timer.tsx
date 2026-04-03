import React, { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Areyousure from "./Areyousure";
import Skip from "../buttons/Skip";
import "./Timer.css";
import BlockCompleteToast from "../notifications/BlockCompleteToast";
import Rating from "../rating/Rating";
import { finalizeActivePomodoroSession } from "../../services/pomoprogressService";
import { useSessionStore } from "../../store/sessionStore";

type TimerMode = "work" | "break";

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
  const previousModeRef = useRef<TimerMode>(mode);

  const [showBlockCompleteToast, setShowBlockCompleteToast] = useState(false);
  const [toastBlockNumber, setToastBlockNumber] = useState(1);

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

  window.onbeforeunload = function () {
    return true;
  };

  /**
   * Single place to update countdown: integer seconds, clamped at 0, ref + state stay aligned.
   * (initiateTimer used to only call setTimeLeft, so the interval read a stale ref and could
   * mis-count; floats also broke `=== 0` and let tick() run past zero.)
   */
  const applyTimeLeft = useCallback((rawSeconds: number) => {
    const next = Math.max(0, Math.round(rawSeconds));
    timeLeftRef.current = next;
    setTimeLeft(next);
  }, []);

  function tick() {
    const current = timeLeftRef.current;
    if (current <= 0) {
      return;
    }
    applyTimeLeft(current - 1);
  }

  function initiateTimer() {
    const workBlockSeconds = ((workMinutes * 60 - totalBreakTime) / numOfblocks) * 60;
    if (mode === "break") {
      applyTimeLeft(breakMinutes * 60);
    } else {
      applyTimeLeft(workBlockSeconds);
    }
  }

  function switchMode() {
    const nextMode: TimerMode = modeRef.current === "work" ? "break" : "work";
    const nextTimeRaw =
      60 * (nextMode === "work" ? (60 * workMinutes - totalBreakTime) / numOfblocks : breakMinutes);
    setMode(nextMode);
    modeRef.current = nextMode;
    applyTimeLeft(nextTimeRaw);
  }

  useEffect(() => {
    initiateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPausedRef.current) {
        return;
      } else if (timeLeftRef.current <= 0) {
        switchMode();
      } else {
        tick();
      }
    }, 1);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);

  useEffect(() => {
    function pause() {
      setIsPaused(true);
      isPausedRef.current = true;
    }

    const store = useSessionStore.getState();

    if (mode === "break" && !store.hasUserRated) {
      pause();
    } else if (mode === "work" && store.hasUserRated) {
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
        }
      });
      latest.setSessionComplete(true);
      latest.setBlockNum(0);
      latest.setHasUserRated(false);
    }
  }, [isPaused, mode, numOfblocks, hasUserRated]);

  const safeTimeLeft = Math.max(0, timeLeft);
  const minutes = Math.floor(safeTimeLeft / 60);
  const seconds = Math.floor(safeTimeLeft % 60);

  /** Session end sets `blockNum` to 0; new runs must reset to 1 from Setter/Finished. This caps display so we never show 0/N while working. */
  const currentWorkBlockIndex = Math.min(numOfblocks, Math.max(1, blockNum));

  const addZero = (value: number) => {
    const safe = Math.max(0, value);
    return safe < 10 ? "0" + safe : String(safe);
  };

  const showTheButtons = () => {
    if (showButtons === true) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {isPaused ? (
              <button
                className="play"
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                }}
              >
                Start
              </button>
            ) : (
              <button
                className="pause"
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  isPausedRef.current = true;
                }}
              >
                Pause
              </button>
            )}
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
