import { TimerMode } from "../types/timerTypes";

export function computeWorkBlockSeconds(params: {
  workMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
}): number {
  const { workMinutes, totalBreakTimeMinutes, totalBlocks } = params;
  return ((workMinutes * 60 - totalBreakTimeMinutes) / totalBlocks) * 60;
}

export function computeNextPhaseSeconds(params: {
  nextMode: TimerMode;
  workMinutes: number;
  totalBreakTimeMinutes: number;
  totalBlocks: number;
  breakMinutes: number;
}): number {
  const { nextMode, workMinutes, totalBreakTimeMinutes, totalBlocks, breakMinutes } = params;
  return 60 * (nextMode === "work" ? (60 * workMinutes - totalBreakTimeMinutes) / totalBlocks : breakMinutes);
}

/** Work already done this session: rated finished blocks plus elapsed time in the current work block. Skipped blocks add no time. */
export function computeCompletedWorkSeconds(params: {
  mode: TimerMode;
  currentWorkBlockIndex: number;
  timeLeftSeconds: number;
  workBlockSeconds: number;
  skippedBlockNumbers: number[];
}): number {
  const { mode, currentWorkBlockIndex, timeLeftSeconds, workBlockSeconds, skippedBlockNumbers } = params;
  const finishedWorkBlocks =
    mode === "break" ? currentWorkBlockIndex : Math.max(0, currentWorkBlockIndex - 1);
  const skippedFinishedCount = skippedBlockNumbers.filter((blockNumber) => {
    if (mode === "break") {
      return blockNumber <= currentWorkBlockIndex;
    }
    return blockNumber < currentWorkBlockIndex;
  }).length;
  const ratedFinishedBlocks = Math.max(0, finishedWorkBlocks - skippedFinishedCount);
  const elapsedInCurrentWork =
    mode === "work" ? Math.max(0, workBlockSeconds - Math.max(0, timeLeftSeconds)) : 0;
  return ratedFinishedBlocks * workBlockSeconds + elapsedInCurrentWork;
}

/** `50m` under an hour, `1h 00m` once hours are involved — matches the session card. */
export function formatFocusDuration(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

