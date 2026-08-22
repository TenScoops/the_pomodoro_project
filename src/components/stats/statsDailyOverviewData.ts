import { summarizeDayFromSessions } from "../chart/sessionChartData";
import { formatFocusWorkHours } from "../focus/recentDaysData";
import { isoDatePrefix, parseLocalISODate } from "../../lib/calendarDates";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import type { EnergyLevelScore, SessionWithRatings } from "../../types/pomoprogress";

export type StatsDailyOverviewWorkType = "Deep Work" | "Routine" | "Deep Work/Routine";

export interface StatsDailyOverviewRow {
  id: string;
  dateLabel: string;
  workType: StatsDailyOverviewWorkType | null;
  deepWorkSeconds: number;
  routineSeconds: number;
  load: number | null;
  hours: string;
  energy: EnergyLevelScore | null;
  /** Focus note from daily_notes — never the energy log note. */
  notes: string | null;
}

export interface DailyOverviewFocusNote {
  date: string;
  note: string;
}

/** First screen of the table; the rest opens with View more. */
export const STATS_DAILY_OVERVIEW_PREVIEW_ROWS = 7;

function formatOverviewDateLabel(isoDate: string): string {
  const parsed = parseLocalISODate(isoDate);
  if (!parsed) {
    return isoDate;
  }
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

function energyByDate(logs: EnergyLogRecord[]): Map<string, EnergyLevelScore> {
  const energyMap = new Map<string, EnergyLevelScore>();
  for (const log of logs) {
    energyMap.set(isoDatePrefix(log.date), log.energy);
  }
  return energyMap;
}

function focusNotesByDate(notes: DailyOverviewFocusNote[]): Map<string, string> {
  const notesMap = new Map<string, string>();
  for (const row of notes) {
    const trimmed = row.note.trim();
    if (trimmed.length > 0) {
      notesMap.set(row.date, trimmed);
    }
  }
  return notesMap;
}

function workTypeTotalsFromSessions(sessions: SessionWithRatings[]): {
  workType: StatsDailyOverviewWorkType | null;
  deepWorkSeconds: number;
  routineSeconds: number;
} {
  let deepWorkSeconds = 0;
  let routineSeconds = 0;
  let hasDeepWork = false;
  let hasRoutine = false;

  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      if (rating.work_type === "Deep Work") {
        hasDeepWork = true;
        deepWorkSeconds += rating.duration_seconds ?? 0;
      } else if (rating.work_type === "Routine") {
        hasRoutine = true;
        routineSeconds += rating.duration_seconds ?? 0;
      }
    }
  }

  let workType: StatsDailyOverviewWorkType | null = null;
  if (hasDeepWork && hasRoutine) {
    workType = "Deep Work/Routine";
  } else if (hasDeepWork) {
    workType = "Deep Work";
  } else if (hasRoutine) {
    workType = "Routine";
  }

  return { workType, deepWorkSeconds, routineSeconds };
}

/**
 * Newest work days in the range first. Energy is the check-in score;
 * notes are Focus notes only.
 */
export function buildDailyOverviewRows(input: {
  sessions: SessionWithRatings[];
  energyLogs: EnergyLogRecord[];
  focusNotes: DailyOverviewFocusNote[];
  rangeStart: string;
  rangeEnd: string;
}): StatsDailyOverviewRow[] {
  const sessionsByDate = groupSessionsByDate(input.sessions);
  const energyMap = energyByDate(input.energyLogs);
  const notesMap = focusNotesByDate(input.focusNotes);

  const datesInRange = Array.from(sessionsByDate.keys()).filter(
    (isoDate) => isoDate >= input.rangeStart && isoDate <= input.rangeEnd
  );
  datesInRange.sort((left, right) => {
    if (left < right) return 1;
    if (left > right) return -1;
    return 0;
  });

  const rows: StatsDailyOverviewRow[] = [];
  for (const isoDate of datesInRange) {
    const daySessions = sessionsByDate.get(isoDate) ?? [];
    const summary = summarizeDayFromSessions(daySessions);
    if (summary.totalSeconds <= 0 && summary.ratingCount === 0 && summary.loadCount === 0) {
      continue;
    }

    const workTypeTotals = workTypeTotalsFromSessions(daySessions);
    rows.push({
      id: isoDate,
      dateLabel: formatOverviewDateLabel(isoDate),
      workType: workTypeTotals.workType,
      deepWorkSeconds: workTypeTotals.deepWorkSeconds,
      routineSeconds: workTypeTotals.routineSeconds,
      load: summary.loadCount === 0 ? null : summary.loadAvg,
      hours: formatFocusWorkHours(summary.totalSeconds),
      energy: energyMap.get(isoDate) ?? null,
      notes: notesMap.get(isoDate) ?? null,
    });
  }

  return rows;
}
