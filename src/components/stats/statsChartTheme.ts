import type { ChartOptions, Tick } from "chart.js";

export const STATS_CHART_BLUE = "#60a5fa";
export const STATS_CHART_BLUE_FILL = "rgba(96, 165, 250, 0.22)";
export const STATS_CHART_GREEN = "#4ade80";
export const STATS_CHART_ORANGE = "#fb923c";
export const STATS_CHART_TICK = "rgba(248, 250, 252, 0.55)";
export const STATS_CHART_GRID = "rgba(255, 255, 255, 0.08)";
export const STATS_CHART_FONT = "Roboto, Kalam, sans-serif";

const WEEKLY_TICK_STEP = 7;

export type StatsYAxisConfig = {
  title: string;
  min: number;
  max: number;
  stepSize: number;
  formatTick?: (tickValue: string | number) => string;
};

/** Show a label about once a week so the axis stays readable with a full month of points. */
export function weeklyTickLabel(labels: string[], tickIndex: number): string {
  if (tickIndex % WEEKLY_TICK_STEP !== 0) {
    return "";
  }
  return labels[tickIndex] ?? "";
}

export function buildStatsLineScaleOptions(
  labels: string[],
  yAxis: StatsYAxisConfig
): NonNullable<ChartOptions<"line">["scales"]> {
  return {
    x: {
      grid: { display: false },
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        color: STATS_CHART_TICK,
        font: { family: STATS_CHART_FONT, size: 11 },
        callback: (_tickValue: string | number, tickIndex: number, _ticks: Tick[]) =>
          weeklyTickLabel(labels, tickIndex),
      },
    },
    y: {
      min: yAxis.min,
      max: yAxis.max,
      title: {
        display: Boolean(yAxis.title),
        text: yAxis.title,
        color: STATS_CHART_TICK,
        font: { family: STATS_CHART_FONT, size: 11 },
      },
      ticks: {
        color: STATS_CHART_TICK,
        font: { family: STATS_CHART_FONT, size: 11 },
        stepSize: yAxis.stepSize,
        callback: yAxis.formatTick,
      },
      grid: {
        color: STATS_CHART_GRID,
      },
      border: {
        display: false,
      },
    },
  };
}
