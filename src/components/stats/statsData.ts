export type StatsSummaryCardId = "hours" | "energy" | "load" | "productivity";

export type StatsSummaryCard = {
  id: StatsSummaryCardId;
  label: string;
  value: string;
  suffix: string | null;
  /** Null until we compare against the previous period. */
  trendPercent: number | null;
};

export type StatsDailyPoint = {
  label: string;
  hours: number;
  energy: number;
  load: number;
};

/** One point per day so the charts look filled before live session data is wired up. */
const HOURS_SERIES = [
  4.8, 4.1, 3.4, 3.2, 3.8, 4.6, 5.2, 4.9, 4.3, 3.9, 4.4, 5.1, 5.6, 4.8, 4.2, 3.7, 4.5, 5.0, 5.4, 4.6, 5.1, 5.8, 6.1,
  5.3, 4.4, 3.6, 4.1, 4.8, 5.2,
];

const ENERGY_SERIES = [
  3.6, 3.5, 3.4, 3.7, 3.8, 4.0, 4.2, 4.0, 3.8, 3.7, 3.9, 4.1, 4.3, 4.0, 3.8, 3.6, 3.9, 4.1, 4.4, 4.2, 4.0, 4.3, 4.5,
  4.2, 3.9, 3.7, 3.8, 4.0, 4.1,
];

const LOAD_SERIES = [
  2.8, 2.6, 2.5, 2.7, 2.9, 3.1, 3.3, 3.2, 3.0, 2.8, 2.9, 3.2, 3.4, 3.1, 2.9, 2.7, 3.0, 3.2, 3.5, 3.3, 3.1, 3.4, 3.6,
  3.3, 3.0, 2.8, 2.9, 3.1, 3.2,
];

function buildStatsDailyPoints(): StatsDailyPoint[] {
  const rangeStart = new Date(2024, 3, 15);
  return HOURS_SERIES.map((hoursValue, dayIndex) => {
    const day = new Date(rangeStart);
    day.setDate(rangeStart.getDate() + dayIndex);
    return {
      label: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      hours: hoursValue,
      energy: ENERGY_SERIES[dayIndex] ?? 0,
      load: LOAD_SERIES[dayIndex] ?? 0,
    };
  });
}

export const STATS_DAILY_POINTS: StatsDailyPoint[] = buildStatsDailyPoints();
