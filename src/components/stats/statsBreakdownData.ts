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
  label: string;
  hours: number;
  percent: number;
  barColor: string;
};

export const STATS_WORK_TYPE_TOTAL_HOURS = 68.1;

/** Placeholder mix of Deep Work vs Routine for the donut before live data is wired up. */
export const STATS_WORK_TYPE_SLICES: StatsWorkTypeSlice[] = [
  { id: "deep", label: "Deep Work", hours: 41.2, percent: 61, color: "#a855f7" },
  { id: "routine", label: "Routine", hours: 26.9, percent: 39, color: "#3b82f6" },
];

/** Placeholder hours at each load score; 5 is listed first to match the mock. */
export const STATS_LOAD_BARS: StatsLoadBar[] = [
  { id: "load-5", level: 5, label: "Very Heavy", hours: 8.1, percent: 12, barColor: "#f87171" },
  { id: "load-4", level: 4, label: "Heavy", hours: 22.3, percent: 33, barColor: "#fb923c" },
  { id: "load-3", level: 3, label: "Moderate", hours: 24.7, percent: 36, barColor: "#fbbf24" },
  { id: "load-2", level: 2, label: "Light", hours: 10.2, percent: 15, barColor: "#86efac" },
  { id: "load-1", level: 1, label: "Very Light", hours: 2.8, percent: 4, barColor: "#22c55e" },
];
