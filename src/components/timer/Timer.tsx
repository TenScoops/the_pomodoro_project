import React, { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Areyousure from "./Areyousure";
import Skip from "../buttons/Skip";
import "./Timer.css";
import Rating from "../rating/Rating";
import { useSessionStore } from "../../store/sessionStore";

type TimerMode = "work" | "break" | "";

const Timer = () => {
  const {
    numOfBreaks,
    breakMinutes,
    workMinutes,
    sessionComplete,
    setShowTimerPage,
    setIsWorkGreater,
    blockNum,
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
  const [mode, setMode] = useState<TimerMode>("");

  const timeLeftRef = useRef(timeLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef<TimerMode>(mode);

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

  window.onbeforeunload = function () {
    return true;
  };

  function tick() {
    timeLeftRef.current--;
    setTimeLeft(timeLeftRef.current);
  }

  function initiateTimer() {
    if (mode === "work") {
      setTimeLeft(((workMinutes * 60 - totalBreakTime) / numOfblocks) * 60);
    } else if (mode === "break") {
      setTimeLeft(breakMinutes * 60);
    } else {
      setTimeLeft(((workMinutes * 60 - totalBreakTime) / numOfblocks) * 60);
    }
  }

  function switchMode() {
    const nextMode: TimerMode = modeRef.current === "work" ? "break" : "work";
    const nextTime =
      60 *
      (nextMode === "work" ? (60 * workMinutes - totalBreakTime) / numOfblocks : breakMinutes);
    setMode(nextMode);
    modeRef.current = nextMode;
    setTimeLeft(nextTime);
    timeLeftRef.current = nextTime;
  }

  useEffect(() => {
    initiateTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, numOfBreaks, breakMinutes]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPausedRef.current) {
        return;
      } else if (timeLeftRef.current === 0) {
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
    if (latest.blockNum === numOfblocks && mode === "break") {
      latest.setSessionComplete(true);
      latest.setBlockNum(0);
    }
  }, [isPaused, mode, numOfblocks]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  const addZero = (value: number) => {
    return value < 10 ? "0" + value : String(value);
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
                  timeLeftRef.current = 0;
                  setMode("work");
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
            <p>&nbsp;You are currently: {mode === "work" ? "working.." : "on break."}&nbsp;</p>
          </div>
        )}
      </div>

      {mode === "work" && (
        <div style={{ borderRadius: "10px", marginBottom: "20px" }} className="blockdiv2">
          <p>
            &nbsp;Block #{blockNumRef.current}/{numOfblocks}&nbsp;
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
    </div>
  );
};

export default Timer;
