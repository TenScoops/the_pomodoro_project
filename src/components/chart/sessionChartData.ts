import type { SessionWithRatings } from "../../types/pomoprogress";
import type { ChartPoint, DummyBarDataset } from "./dummyData";
import { getProductivityBarColor } from "./dummyData";
import { getMonthDayMetas, getYearMonthMetas } from "./chartLabels";

const NO_DATA_BAR_COLOR = "rgb(90, 90, 90)";

function collectRatingsFromSessions(sessions: SessionWithRatings[]): number[] {
  const ratings: number[] = [];
  for (const session of sessions) {
    for (const row of session.block_ratings ?? []) {
      ratings.push(row.rating);
    }
  }
  return ratings;
}

function averageRatings(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((accumulator, value) => accumulator + value, 0);
  return Number((sum / values.length).toFixed(2));
}

function groupSessionsByDate(sessions: SessionWithRatings[]): Map<string, SessionWithRatings[]> {
  const map = new Map<string, SessionWithRatings[]>();
  for (const session of sessions) {
    const existing = map.get(session.date) ?? [];
    existing.push(session);
    map.set(session.date, existing);
  }
  return map;
}

/** Per-calendar-day hours (sum of `total_time_worked` / 3600); updates after each rated block. */
export function buildMonthHoursLineSeriesFromSessions(
  sessions: SessionWithRatings[],
  year: number,
  monthIndex0: number
): { labels: string[]; hoursSeries: number[] } {
  const byDate = groupSessionsByDate(sessions);
  const dayMetas = getMonthDayMetas(year, monthIndex0, "full");
  const labels: string[] = [];
  const hoursSeries: number[] = [];
  for (const { iso, label } of dayMetas) {
    labels.push(label);
    const daySessions = byDate.get(iso) ?? [];
    const totalSeconds = daySessions.reduce((sum, session) => sum + session.total_time_worked, 0);
    hoursSeries.push(Number((totalSeconds / 3600).toFixed(3)));
  }
  return { labels, hoursSeries };
}

/** Per-calendar-month hours for a year; updates after each rated block. */
export function buildYearHoursLineSeriesFromSessions(
  sessions: SessionWithRatings[],
  year: number
): { labels: string[]; hoursSeries: number[] } {
  const monthMetas = getYearMonthMetas(year);
  const labels: string[] = [];
  const hoursSeries: number[] = [];
  for (const { label, startDate, endDate } of monthMetas) {
    labels.push(label);
    const monthSessions = sessions.filter(
      (session) => session.date >= startDate && session.date <= endDate
    );
    const totalSeconds = monthSessions.reduce((sum, session) => sum + session.total_time_worked, 0);
    hoursSeries.push(Number((totalSeconds / 3600).toFixed(3)));
  }
  return { labels, hoursSeries };
}

export function buildMonthBarDatasetFromSessions(
  sessions: SessionWithRatings[],
  year: number,
  monthIndex0: number
): DummyBarDataset {
  const byDate = groupSessionsByDate(sessions);
  const dayMetas = getMonthDayMetas(year, monthIndex0);

  const monthData: ChartPoint[] = dayMetas.map(({ iso, label }) => {
    const daySessions = byDate.get(iso) ?? [];
    const ratings = collectRatingsFromSessions(daySessions);
    const productivityAvg = averageRatings(ratings);
    const totalSeconds = daySessions.reduce((sum, session) => sum + session.total_time_worked, 0);
    const lengthHours = Number((totalSeconds / 3600).toFixed(1));
    const sessionCount = daySessions.length;
    const blocksCompleted = daySessions.reduce((sum, session) => sum + session.blocks_completed, 0);
    const backgroundColor =
      ratings.length === 0 ? NO_DATA_BAR_COLOR : getProductivityBarColor(productivityAvg);

    return {
      x: label,
      y: productivityAvg,
      length: lengthHours,
      sessions: sessionCount,
      backgroundColor,
      blocksCompleted,
    };
  });

  return {
    label: "Productivity avg",
    data: monthData,
    backgroundColor: monthData.map((point) => point.backgroundColor),
    borderColor: "black",
    borderWidth: 3.5,
  };
}

export function buildYearBarDatasetFromSessions(sessions: SessionWithRatings[], year: number): DummyBarDataset {
  const monthMetas = getYearMonthMetas(year);

  const yearData: ChartPoint[] = monthMetas.map(({ label, startDate, endDate }) => {
    const monthSessions = sessions.filter(
      (session) => session.date >= startDate && session.date <= endDate
    );
    const ratings = collectRatingsFromSessions(monthSessions);
    const productivityAvg = averageRatings(ratings);
    const totalSeconds = monthSessions.reduce((sum, session) => sum + session.total_time_worked, 0);
    const lengthHours = Number((totalSeconds / 3600).toFixed(1));
    const sessionCount = monthSessions.length;
    const blocksCompleted = monthSessions.reduce((sum, session) => sum + session.blocks_completed, 0);
    const backgroundColor =
      ratings.length === 0 ? NO_DATA_BAR_COLOR : getProductivityBarColor(productivityAvg);

    return {
      x: label,
      y: productivityAvg,
      length: lengthHours,
      sessions: sessionCount,
      backgroundColor,
      blocksCompleted,
    };
  });

  return {
    label: "Productivity avg",
    data: yearData,
    backgroundColor: yearData.map((point) => point.backgroundColor),
    borderColor: "black",
    borderWidth: 3.5,
  };
}
