import React from "react";

type TimerMode = "work" | "break";

type TimerClockProps = {
  showClock: boolean;
  showButtons: boolean;
  mode: TimerMode;
  currentWorkBlockIndex: number;
  totalBlocks: number;
  minutesLabel: string;
  secondsLabel: string;
  totalWorkTimeMinutes: number;
  totalBreakTimeMinutes: number;
  effectiveMultiplier: number;
};

export default function TimerClock({
  showClock,
  showButtons,
  mode,
  currentWorkBlockIndex,
  totalBlocks,
  minutesLabel,
  secondsLabel,
  totalWorkTimeMinutes,
  totalBreakTimeMinutes,
  effectiveMultiplier,
}: TimerClockProps) {
  if (!showClock) {
    return null;
  }

  const workLessThanBreak = totalWorkTimeMinutes < totalBreakTimeMinutes;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="blockdiv2">
          <p>&nbsp;You are currently: {mode === "break" ? "on break." : "working.."}&nbsp;</p>
        </div>
      </div>

      {mode === "work" && (
        <div style={{ marginBottom: "20px" }} className="blockdiv2">
          <p>
            &nbsp;Block #{currentWorkBlockIndex}/{totalBlocks}&nbsp;
          </p>
        </div>
      )}

      <div className="timediv">
        <div className={showButtons ? "time" : "time + new-font"}>
          <p style={{ marginLeft: "20px" }} className="minutes">
            {workLessThanBreak ? "00" : minutesLabel}
          </p>
          <p className="semicolon">:</p>
          <p style={{ marginRight: "20px" }} className="seconds">
            {workLessThanBreak ? "00" : secondsLabel}
          </p>
        </div>
      </div>

      {effectiveMultiplier > 1 && (
        <div style={{ marginTop: "8px" }} className="blockdiv2">
          <p style={{ fontSize: "15px" }}>&nbsp;Speed ×{effectiveMultiplier}&nbsp;</p>
        </div>
      )}
    </>
  );
}

