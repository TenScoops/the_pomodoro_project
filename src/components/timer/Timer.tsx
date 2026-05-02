import React from "react";
import { useShallow } from "zustand/react/shallow";
import Areyousure from "./Areyousure";
import "./Timer.css";
import BlockCompleteToast from "../notifications/BlockCompleteToast";
import Rating from "../rating/Rating";
import TimerClock from "./components/TimerClock";
import TimerControls from "./components/TimerControls";
import TimerSessionSummary from "./components/TimerSessionSummary";
import usePomodoroTimer from "./hooks/usePomodoroTimer";
import { useSessionStore } from "../../store/sessionStore";

const Timer = () => {
  const {
    showData,
    showButtons,
    showClock,
    setClicked,
    setCancelTheSession,
    cancelTheSession,
  } = useSessionStore(
    useShallow((s) => ({
      showData: s.showData,
      showButtons: s.showButtons,
      showClock: s.showClock,
      setClicked: s.setClicked,
      setCancelTheSession: s.setCancelTheSession,
      cancelTheSession: s.cancelTheSession,
    }))
  );

  const addZero = (value: number) => {
    const safe = Math.max(0, value);
    return safe < 10 ? "0" + safe : String(safe);
  };

  const {
    isPaused,
    mode,
    minutes,
    seconds,
    totalBreakTimeMinutes,
    totalWorkTimeMinutes,
    totalBlocks,
    currentWorkBlockIndex,
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
  } = usePomodoroTimer();

  return (
    <div className="timer">
      <TimerSessionSummary
        showData={showData}
        totalWorkTimeMinutes={totalWorkTimeMinutes}
        totalBreakTimeMinutes={totalBreakTimeMinutes}
        totalBlocks={totalBlocks}
        perBlockTimeLabel={`${addZero(minutes)}:${addZero(seconds)}`}
      />

      <TimerClock
        showClock={showClock}
        showButtons={showButtons}
        mode={mode}
        currentWorkBlockIndex={currentWorkBlockIndex}
        totalBlocks={totalBlocks}
        minutesLabel={addZero(minutes)}
        secondsLabel={addZero(seconds)}
        totalWorkTimeMinutes={totalWorkTimeMinutes}
        totalBreakTimeMinutes={totalBreakTimeMinutes}
        effectiveMultiplier={effectiveMultiplier}
      />

      {showClock && (
        <div className="timerbuttons">
          <TimerControls
            showButtons={showButtons}
            isPaused={isPaused}
            speedBoostEnabled={speedBoostEnabled}
            speedBoostLabel={speedBoostLabel}
            speedBoostTitle={speedBoostTitle}
            mode={mode}
            onStart={resumeTimer}
            onPause={pauseFromClock}
            onToggleSpeedBoost={toggleSpeedBoost}
            onSkipBreak={mode === "break" ? skipBreak : undefined}
            onCancelSession={() => {
              setClicked(false);
              setCancelTheSession(true);
            }}
          />
        </div>
      )}

      {totalWorkTimeMinutes < totalBreakTimeMinutes && (
        <div className="blockdiv" style={{ backgroundColor: "white", color: "darkred" }}>
          <p>Worktime cannot be less than your breaktime.</p>
        </div>
      )}

      {mode === "break" ? <Rating /> : null}
      {cancelTheSession ? <Areyousure /> : null}

      <BlockCompleteToast
        show={showBlockCompleteToast}
        blockNumber={toastBlockNumber}
        totalBlocks={totalBlocks}
        onDismiss={dismissBlockCompleteToast}
      />
    </div>
  );
};

export default Timer;
