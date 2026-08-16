import type { BlockWorkType } from "../types/pomoprogress";

/** Deep Work counts fully toward aggregate load. */
export const DEEP_WORK_LOAD_WEIGHT = 1;

/** Routine counts half as much as Deep Work when averaging the day. */
export const ROUTINE_LOAD_WEIGHT = 0.5;

export interface LoadBlockInput {
  load: number | null;
  workType: BlockWorkType | null;
  durationSeconds: number | null;
}

/**
 * What a block contributed to day-level load analysis.
 * `ratedLoad` is the 1–5 score the user entered; it is never scaled to a new 1–5.
 */
export interface BlockEffectiveWorkload {
  ratedLoad: number;
  workType: BlockWorkType | null;
  hours: number;
  weight: number;
  weightedLoadContribution: number;
  weightedHours: number;
}

export interface WeightedDailyLoad {
  /** Σ(Load × Hours × Weight) ÷ Σ(Hours × Weight); 0 when nothing can be averaged. */
  loadAvg: number;
  loadCount: number;
  blocks: BlockEffectiveWorkload[];
}

/** Influence of a work type on aggregate load. Unknown type is treated as Deep Work. */
export function workTypeLoadWeight(workType: BlockWorkType | null): number {
  if (workType === "Routine") {
    return ROUTINE_LOAD_WEIGHT;
  }
  return DEEP_WORK_LOAD_WEIGHT;
}

function hoursFromDuration(durationSeconds: number | null): number {
  if (durationSeconds == null || durationSeconds <= 0) {
    return 0;
  }
  return durationSeconds / 3600;
}

export function blockEffectiveWorkload(
  load: number,
  workType: BlockWorkType | null,
  durationSeconds: number | null
): BlockEffectiveWorkload | null {
  const hours = hoursFromDuration(durationSeconds);
  if (hours <= 0) {
    return null;
  }
  const weight = workTypeLoadWeight(workType);
  return {
    ratedLoad: load,
    workType,
    hours,
    weight,
    weightedLoadContribution: load * hours * weight,
    weightedHours: hours * weight,
  };
}

/**
 * Day (or range) effective load. Ratings stay as entered; Routine only halves
 * how much that block pulls the average.
 */
export function weightedDailyLoad(blocks: LoadBlockInput[]): WeightedDailyLoad {
  const effectiveBlocks: BlockEffectiveWorkload[] = [];

  for (const block of blocks) {
    if (block.load == null) {
      continue;
    }
    const effective = blockEffectiveWorkload(block.load, block.workType, block.durationSeconds);
    if (effective == null) {
      continue;
    }
    effectiveBlocks.push(effective);
  }

  if (effectiveBlocks.length === 0) {
    return { loadAvg: 0, loadCount: 0, blocks: [] };
  }

  let weightedLoadSum = 0;
  let weightedHoursSum = 0;
  for (const effective of effectiveBlocks) {
    weightedLoadSum += effective.weightedLoadContribution;
    weightedHoursSum += effective.weightedHours;
  }

  if (weightedHoursSum <= 0) {
    return { loadAvg: 0, loadCount: 0, blocks: effectiveBlocks };
  }

  return {
    loadAvg: Number((weightedLoadSum / weightedHoursSum).toFixed(2)),
    loadCount: effectiveBlocks.length,
    blocks: effectiveBlocks,
  };
}
