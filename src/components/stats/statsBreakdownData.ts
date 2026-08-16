import type { SessionWithRatings } from "../../types/pomoprogress";

export type StatsWorkTypeSlice = {
  id: "deep" | "routine";
  label: string;
  hours: number;
  percent: number;
  color: string;
};

export type StatsLoadBar = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  titleRange: string;
  label: string;
  hours: number;
  percent: number;
  barColor: string;
};

type LoadBandLevel = 1 | 2 | 3 | 4 | 5;

interface LoadBandMeta {
  level: LoadBandLevel;
  titleRange: string;
  label: string;
  barColor: string;
}

const DEEP_WORK_COLOR = "#a855f7";
const ROUTINE_COLOR = "#3b82f6";

/** Fixed labels and colors; hours come from rated blocks. */
export const STATS_LOAD_BANDS: readonly LoadBandMeta[] = [
  { level: 5, titleRange: "5.00", label: "Very Heavy", barColor: "#f87171" },
  { level: 4, titleRange: "4.00 – 4.75", label: "Heavy", barColor: "#fb923c" },
  { level: 3, titleRange: "3.00 – 3.75", label: "Moderate", barColor: "#fbbf24" },
  { level: 2, titleRange: "2.00 – 2.75", label: "Light", barColor: "#86efac" },
  { level: 1, titleRange: "1.00 – 1.75", label: "Very Light", barColor: "#22c55e" },
];

function hoursFromSeconds(durationSeconds: number): number {
  return durationSeconds / 3600;
}

function roundHours(hours: number): number {
  return Number(hours.toFixed(1));
}

/**
 * Integer percents that add to 100. Zero-hour rows stay 0% and never get leftover points.
 */
export function percentsThatSumTo100(hoursByRow: number[]): number[] {
  const percents = hoursByRow.map(() => 0);
  let totalHours = 0;
  for (const hours of hoursByRow) {
    if (hours > 0) {
      totalHours += hours;
    }
  }
  if (totalHours <= 0) {
    return percents;
  }

  const positiveIndexes: number[] = [];
  const exactPercents: number[] = [];
  for (let rowIndex = 0; rowIndex < hoursByRow.length; rowIndex += 1) {
    const hours = hoursByRow[rowIndex] ?? 0;
    if (hours <= 0) {
      continue;
    }
    positiveIndexes.push(rowIndex);
    exactPercents.push((hours / totalHours) * 100);
  }

  let assigned = 0;
  const floors: number[] = [];
  for (const exact of exactPercents) {
    const floorValue = Math.floor(exact);
    floors.push(floorValue);
    assigned += floorValue;
  }

  let remainder = 100 - assigned;
  const remainderOrder = exactPercents
    .map((exact, orderIndex) => ({
      orderIndex,
      fraction: exact - Math.floor(exact),
    }))
    .sort((left, right) => right.fraction - left.fraction);

  for (const item of remainderOrder) {
    if (remainder <= 0) {
      break;
    }
    const floorValue = floors[item.orderIndex];
    if (floorValue == null) {
      continue;
    }
    floors[item.orderIndex] = floorValue + 1;
    remainder -= 1;
  }

  for (let orderIndex = 0; orderIndex < positiveIndexes.length; orderIndex += 1) {
    const rowIndex = positiveIndexes[orderIndex];
    const percent = floors[orderIndex];
    if (rowIndex == null || percent == null) {
      continue;
    }
    percents[rowIndex] = percent;
  }
  return percents;
}

/** 1.00–1.75 → 1, …, 4.00–4.75 → 4, 5.00 → 5. Invalid scores are ignored. */
export function loadBandLevel(load: number): LoadBandLevel | null {
  if (load < 1 || load > 5) {
    return null;
  }
  if (load === 5) {
    return 5;
  }
  const floored = Math.floor(load);
  if (floored < 1 || floored > 4) {
    return null;
  }
  return floored as 1 | 2 | 3 | 4;
}

export function buildWorkTypeSlicesFromSessions(sessions: SessionWithRatings[]): {
  slices: StatsWorkTypeSlice[];
  totalHours: number;
} {
  let deepSeconds = 0;
  let routineSeconds = 0;

  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      const durationSeconds = rating.duration_seconds ?? 0;
      if (durationSeconds <= 0) {
        continue;
      }
      if (rating.work_type === "Deep Work") {
        deepSeconds += durationSeconds;
      } else if (rating.work_type === "Routine") {
        routineSeconds += durationSeconds;
      }
    }
  }

  const deepHours = hoursFromSeconds(deepSeconds);
  const routineHours = hoursFromSeconds(routineSeconds);
  const percents = percentsThatSumTo100([deepHours, routineHours]);
  const slices: StatsWorkTypeSlice[] = [
    {
      id: "deep",
      label: "Deep Work",
      hours: roundHours(deepHours),
      percent: percents[0] ?? 0,
      color: DEEP_WORK_COLOR,
    },
    {
      id: "routine",
      label: "Routine",
      hours: roundHours(routineHours),
      percent: percents[1] ?? 0,
      color: ROUTINE_COLOR,
    },
  ];

  return {
    slices,
    totalHours: roundHours(deepHours + routineHours),
  };
}

export function buildLoadBarsFromSessions(sessions: SessionWithRatings[]): StatsLoadBar[] {
  const secondsByLevel: Record<LoadBandLevel, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      if (rating.load == null) {
        continue;
      }
      const durationSeconds = rating.duration_seconds ?? 0;
      if (durationSeconds <= 0) {
        continue;
      }
      const band = loadBandLevel(rating.load);
      if (band == null) {
        continue;
      }
      secondsByLevel[band] += durationSeconds;
    }
  }

  const hoursInBandOrder = STATS_LOAD_BANDS.map((band) => hoursFromSeconds(secondsByLevel[band.level]));
  const percents = percentsThatSumTo100(hoursInBandOrder);

  return STATS_LOAD_BANDS.map((band, bandIndex) => ({
    id: `load-${band.level}`,
    level: band.level,
    titleRange: band.titleRange,
    label: band.label,
    hours: roundHours(hoursInBandOrder[bandIndex] ?? 0),
    percent: percents[bandIndex] ?? 0,
    barColor: band.barColor,
  }));
}

export function monthHasLoadHours(bars: StatsLoadBar[]): boolean {
  return bars.some((bar) => bar.hours > 0);
}

export function monthHasWorkTypeHours(slices: StatsWorkTypeSlice[]): boolean {
  return slices.some((slice) => slice.hours > 0);
}
