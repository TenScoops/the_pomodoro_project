import React from "react";
import Skip from "../../buttons/Skip";

type TimerMode = "work" | "break";

type TimerControlsProps = {
  showButtons: boolean;
  isPaused: boolean;
  speedBoostEnabled: boolean;
  speedBoostLabel: string;
  speedBoostTitle: string;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onToggleSpeedBoost: () => void;
  onSkipBreak?: () => void;
  onCancelSession: () => void;
};

export default function TimerControls({
  showButtons,
  isPaused,
  speedBoostEnabled,
  speedBoostLabel,
  speedBoostTitle,
  mode,
  onStart,
  onPause,
  onToggleSpeedBoost,
  onSkipBreak,
  onCancelSession,
}: TimerControlsProps) {
  if (!showButtons) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div
        className="timer-control-row"
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {isPaused ? (
          <button className="play" type="button" onClick={onStart}>
            Start
          </button>
        ) : (
          <button className="pause" type="button" onClick={onPause}>
            Pause
          </button>
        )}

        <button className="speedBoost" type="button" title={speedBoostTitle} onClick={onToggleSpeedBoost}>
          {speedBoostLabel}
        </button>

        {mode === "break" && onSkipBreak ? <Skip title="Skip Break" onClick={onSkipBreak} /> : null}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button
          className="cancel"
          style={{ width: "150px", height: "25px", marginLeft: "55px" }}
          type="button"
          onClick={onCancelSession}
        >
          Cancel Session
        </button>
      </div>
    </div>
  );
}

