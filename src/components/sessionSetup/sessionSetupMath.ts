export type SessionWorkType = "Deep Work" | "Routine";

export type SessionSetupDraft = {
  focusMinutes: number;
  totalBlocks: number;
  breakMinutes: number;
  workType: SessionWorkType;
};

export const FOCUS_STEP_MINUTES = 5;
export const MIN_FOCUS_MINUTES = 15;
export const MAX_FOCUS_MINUTES = 12 * 60;
export const MIN_BLOCKS = 1;
export const MAX_BLOCKS = 12;
export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 60;

export function clampSetupValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Breaks sit between blocks, so one block means no break. */
export function breakCountFromBlocks(totalBlocks: number): number {
  return Math.max(0, totalBlocks - 1);
}

export function minutesPerFocusBlock(focusMinutes: number, totalBlocks: number): number {
  return focusMinutes / Math.max(1, totalBlocks);
}

export function totalBreakTimeMinutes(totalBlocks: number, breakMinutes: number): number {
  return breakCountFromBlocks(totalBlocks) * breakMinutes;
}

export function totalSessionMinutes(draft: SessionSetupDraft): number {
  return draft.focusMinutes + totalBreakTimeMinutes(draft.totalBlocks, draft.breakMinutes);
}

/** Old timer store uses hours for the whole session, including breaks. */
export function toStoreSessionHours(draft: SessionSetupDraft): number {
  return totalSessionMinutes(draft) / 60;
}

export function draftFromStore(params: {
  workMinutesHours: number;
  numOfBreaks: number;
  breakMinutes: number;
  workType: SessionWorkType;
}): SessionSetupDraft {
  const focusMinutes = Math.round(params.workMinutesHours * 60 - params.numOfBreaks * params.breakMinutes);
  return {
    focusMinutes: clampSetupValue(focusMinutes, MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES),
    totalBlocks: clampSetupValue(params.numOfBreaks + 1, MIN_BLOCKS, MAX_BLOCKS),
    breakMinutes: clampSetupValue(params.breakMinutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES),
    workType: params.workType,
  };
}

export function formatStepperDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  const hourWord = hours === 1 ? "hour" : "hours";
  return `${hours} ${hourWord} ${String(minutes).padStart(2, "0")} min`;
}
