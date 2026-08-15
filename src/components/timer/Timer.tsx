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
import { useHydrateTodayFocusNote } from "../../hooks/useHydrateTodayFocusNote";
import { useSessionStore } from "../../store/sessionStore";

const Timer = () => {
  useHydrateTodayFocusNote();
  const { showButtons, showClock, cancelTheSession, setCancelTheSession, setShowSessionSetupModal } =
    useSessionStore(
      useShallow((s) => ({
        showButtons: s.showButtons,
        showClock: s.showClock,
        cancelTheSession: s.cancelTheSession,
        setCancelTheSession: s.setCancelTheSession,
        setShowSessionSetupModal: s.setShowSessionSetupModal,
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
    phaseProgressRatio,
    totalBreakTimeMinutes,
    totalWorkTimeMinutes,
    totalBlocks,
    currentWorkBlockIndex,
    completedWorkMinutes,
    remainingWorkMinutes,
    breakLengthMinutes,
    speedBoostTitle,
    speedBoostLabel,
    showBlockCompleteToast,
    toastBlockNumber,
    dismissBlockCompleteToast,
    pauseFromClock,
    resumeTimer,
    toggleSpeedBoost,
    resetCurrentPhase,
  } = usePomodoroTimer();

  return (
    <div className="timer">
      <div className="timer__clockColumn">
        <TimerClock
          showClock={showClock}
          minutesLabel={addZero(minutes)}
          secondsLabel={addZero(seconds)}
          totalWorkTimeMinutes={totalWorkTimeMinutes}
          totalBreakTimeMinutes={totalBreakTimeMinutes}
          phaseProgressRatio={phaseProgressRatio}
        />

        {showClock && (
          <TimerControls
            showButtons={showButtons}
            isPaused={isPaused}
            speedBoostLabel={speedBoostLabel}
            speedBoostTitle={speedBoostTitle}
            onStart={resumeTimer}
            onPause={pauseFromClock}
            onReset={resetCurrentPhase}
            onEnd={() => setCancelTheSession(true)}
            onToggleSpeedBoost={toggleSpeedBoost}
          />
        )}
      </div>

      <TimerSessionSummary
        plannedFocusMinutes={totalWorkTimeMinutes}
        completedFocusMinutes={completedWorkMinutes}
        remainingFocusMinutes={remainingWorkMinutes}
        totalBlocks={totalBlocks}
        currentWorkBlockIndex={currentWorkBlockIndex}
        breakLengthMinutes={breakLengthMinutes}
        onEdit={() => setShowSessionSetupModal(true)}
      />

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
