import { parseLocalISODate, shiftLocalISODate } from "../../lib/calendarDates";
import type { SessionWithRatings } from "../../types/pomoprogress";

export interface HoursOverTimePoint {
  label: string;
  hours: number;
}

function eachIsoDateInclusive(rangeStart: string, rangeEnd: string): string[] {
  if (!parseLocalISODate(rangeStart) || !parseLocalISODate(rangeEnd) || rangeStart > rangeEnd) {
    return [];
  }
  const dates: string[] = [];
  let cursor = rangeStart;
  while (cursor <= rangeEnd) {
    dates.push(cursor);
    cursor = shiftLocalISODate(cursor, 1);
  }
  return dates;
}

function compactDayLabel(isoDate: string): string {
  const parsed = parseLocalISODate(isoDate);
  if (!parsed) {
    return isoDate;
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupSessionsByDate(sessions: SessionWithRatings[]): Map<string, SessionWithRatings[]> {
  const sessionsByDate = new Map<string, SessionWithRatings[]>();
  for (const session of sessions) {
    const existing = sessionsByDate.get(session.date) ?? [];
    existing.push(session);
    sessionsByDate.set(session.date, existing);
  }
  return sessionsByDate;
}

/**
 * One point per calendar day in the range.
 * Days with no sessions are 0 hours (a rest day), not missing — the area fill should stay continuous.
 */
export function buildHoursOverTimeSeries(input: {
  sessions: SessionWithRatings[];
  rangeStart: string;
  rangeEnd: string;
}): HoursOverTimePoint[] {
  const dates = eachIsoDateInclusive(input.rangeStart, input.rangeEnd);
  const sessionsByDate = groupSessionsByDate(input.sessions);

  return dates.map((isoDate) => {
    const daySessions = sessionsByDate.get(isoDate) ?? [];
    const totalSeconds = daySessions.reduce(
      (total, session) => total + session.total_time_worked,
      0
    );
    return {
      label: compactDayLabel(isoDate),
      hours: Number((totalSeconds / 3600).toFixed(3)),
    };
  });
}

export function hoursOverTimeSeriesHasData(points: HoursOverTimePoint[]): boolean {
  return points.some((point) => point.hours > 0);
}

const HOURS_AXIS_FLOOR = 5;

/** Keep the 0–5h scale unless a day actually went higher. */
export function hoursAxisMax(hoursSeries: number[]): number {
  const peakHours = hoursSeries.length === 0 ? 0 : Math.max(...hoursSeries, 0);
  if (peakHours <= HOURS_AXIS_FLOOR) {
    return HOURS_AXIS_FLOOR;
  }
  return Math.ceil(peakHours / 2) * 2;
}
