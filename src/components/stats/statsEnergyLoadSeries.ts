import { summarizeDayFromSessions } from "../chart/sessionChartData";
import { parseLocalISODate, shiftLocalISODate } from "../../lib/calendarDates";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import type { SessionWithRatings } from "../../types/pomoprogress";

export interface EnergyLoadChartPoint {
  label: string;
  energy: number | null;
  load: number | null;
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

function energyByDate(logs: EnergyLogRecord[]): Map<string, number> {
  const energyMap = new Map<string, number>();
  for (const log of logs) {
    energyMap.set(log.date, log.energy);
  }
  return energyMap;
}

/** One point per calendar day in the range. Missing energy or load is `null` so the line can skip that day. */
export function buildEnergyLoadSeries(input: {
  sessions: SessionWithRatings[];
  energyLogs: EnergyLogRecord[];
  rangeStart: string;
  rangeEnd: string;
}): EnergyLoadChartPoint[] {
  const dates = eachIsoDateInclusive(input.rangeStart, input.rangeEnd);
  const sessionsByDate = groupSessionsByDate(input.sessions);
  const energyMap = energyByDate(input.energyLogs);

  return dates.map((isoDate) => {
    const daySessions = sessionsByDate.get(isoDate) ?? [];
    const loadSummary = summarizeDayFromSessions(daySessions);
    return {
      label: compactDayLabel(isoDate),
      energy: energyMap.get(isoDate) ?? null,
      load: loadSummary.loadCount > 0 ? loadSummary.loadAvg : null,
    };
  });
}

export function energyLoadSeriesHasData(points: EnergyLoadChartPoint[]): boolean {
  return points.some((point) => point.energy != null || point.load != null);
}
