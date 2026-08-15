import React from "react";

type TimerControlsProps = {
  showButtons: boolean;
  isPaused: boolean;
  speedBoostLabel: string;
  speedBoostTitle: string;
  onStart: () => void;
  onPause: () => void;
  onToggleSpeedBoost: () => void;
};

export default function TimerControls({
  showButtons,
  isPaused,
  speedBoostLabel,
  speedBoostTitle,
  onStart,
  onPause,
  onToggleSpeedBoost,
}: TimerControlsProps) {
  if (!showButtons) {
    return null;
  }

  return (
    <div className="timerHeroControls">
      <div className="timerHeroStartRow">
        {isPaused ? (
          <button className="timerStart" type="button" onClick={onStart}>
            START
          </button>
        ) : (
          <button className="timerStart" type="button" onClick={onPause}>
            PAUSE
          </button>
        )}

        <button
          className="timerSpeedBoost"
          type="button"
          title={speedBoostTitle}
          onClick={onToggleSpeedBoost}
        >
          {speedBoostLabel}
        </button>
      </div>

      <button className="timerAddNote" type="button">
        + Add note
      </button>
    </div>
  );
}
