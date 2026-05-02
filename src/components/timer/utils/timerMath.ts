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

