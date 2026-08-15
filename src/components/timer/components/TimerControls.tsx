import React from "react";
import { HiPause, HiPlay, HiStop } from "react-icons/hi2";

type TimerControlsProps = {
  showButtons: boolean;
  isPaused: boolean;
  speedBoostLabel: string;
  speedBoostTitle: string;
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
  onToggleSpeedBoost: () => void;
};

export default function TimerControls({
  showButtons,
  isPaused,
  speedBoostLabel,
  speedBoostTitle,
  onStart,
  onPause,
  onEnd,
  onToggleSpeedBoost,
}: TimerControlsProps) {
  if (!showButtons) {
    return null;
  }

  return (
    <div className="timerHeroControls">
      <div className="timerHeroStartRow">
        {isPaused ? (
          <button className="timerRoundBtn timerRoundBtn--primary" type="button" onClick={onStart}>
            <span className="timerRoundBtn__face">
              <HiPlay className="timerRoundBtn__icon timerRoundBtn__icon--play" aria-hidden />
            </span>
            <span className="timerRoundBtn__label">Start</span>
          </button>
        ) : (
          <button className="timerRoundBtn timerRoundBtn--primary" type="button" onClick={onPause}>
            <span className="timerRoundBtn__face">
              <HiPause className="timerRoundBtn__icon" aria-hidden />
            </span>
            <span className="timerRoundBtn__label">Pause</span>
          </button>
        )}

        <button className="timerRoundBtn timerRoundBtn--ghost" type="button" onClick={onEnd}>
          <span className="timerRoundBtn__face">
            <HiStop className="timerRoundBtn__icon" aria-hidden />
          </span>
          <span className="timerRoundBtn__label">End</span>
        </button>

        <button
          className="timerSpeedBoost"
          type="button"
          title={speedBoostTitle}
          onClick={onToggleSpeedBoost}
        >
          {speedBoostLabel}
        </button>
      </div>
    </div>
  );
}
