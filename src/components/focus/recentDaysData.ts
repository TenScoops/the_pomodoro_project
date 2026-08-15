import { summarizeDayFromSessions } from "../chart/sessionChartData";
import { shiftLocalISODate } from "../../lib/calendarDates";
import type { SessionWithRatings } from "../../types/pomoprogress";

export type WorkType = "Deep Work" | "Routine";
export type WorkTypeLabel = WorkType | "Deep Work/Routine";
export type LoadScore = 1 | 2 | 3 | 4 | 5;

export type RecentDaySummaryCard = {
  id: "hours" | "load" | "productivity";
  label: string;
  value: string;
};

export type RecentDayRow = {
  id: string;
  dateLabel: string;
  dateDetail: string | null;
  workType: WorkTypeLabel | null;
  deepWorkSeconds: number;
  routineSeconds: number;
  load: LoadScore | null;
  /** Mean block rating 1–10; null when the day has no productivity ratings. */
  productivity: number | null;
  hours: string;
  notes: string | null;
};

/** Cap so the Focus table stays a short recap, not a full history. */
export const MAX_RECENT_DAY_ROWS = 4;

/** How far back to look when collecting the latest four days with work. */
const RECENT_DAYS_LOOKBACK = 180;

export const RECENT_DAY_SUMMARY_CARDS: RecentDaySummaryCard[] = [
  { id: "hours", label: "Total Work Hours", value: "0" },
  { id: "load", label: "Average Load", value: "0" },
  { id: "productivity", label: "Productivity Avg.", value: "0" },
];

export function recentDaysRangeStart(todayIso: string): string {
  return shiftLocalISODate(todayIso, -RECENT_DAYS_LOOKBACK);
}

/** Format seconds as `2h 18m`; zero work time stays `"0"`. */
export function formatFocusWorkHours(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return "0";
  }
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/** Format mean rating as `8.7 / 10`; no ratings or a zero average stays `"0"`. */
export function formatFocusProductivityAvg(productivityAvg: number, ratingCount: number): string {
  if (ratingCount === 0 || productivityAvg === 0) {
    return "0";
  }
  return `${productivityAvg.toFixed(1)} / 10`;
}

/** Format mean load as `3.2 / 5`; no loads or a zero average stays `"0"`. */
export function formatFocusLoadAvg(loadAvg: number, loadCount: number): string {
  if (loadCount === 0 || loadAvg === 0) {
    return "0";
  }
  return `${loadAvg.toFixed(1)} / 5`;
}

function formatDayHeading(isoDate: string): string {
  const [yearText, monthText, dayText] = isoDate.split("-");
  const year = Number(yearText);
  const monthIndex0 = Number(monthText) - 1;
  const day = Number(dayText);
  return new Date(year, monthIndex0, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dateLabelsForIso(
  isoDate: string,
  todayIso: string
): { dateLabel: string; dateDetail: string | null } {
  const heading = formatDayHeading(isoDate);
  if (isoDate === todayIso) {
    return { dateLabel: "Today", dateDetail: heading };
  }
  if (isoDate === shiftLocalISODate(todayIso, -1)) {
    return { dateLabel: "Yesterday", dateDetail: heading };
  }
  return { dateLabel: heading, dateDetail: null };
}

function toLoadScore(loadAvg: number): LoadScore {
  const rounded = Math.round(loadAvg);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as LoadScore;
}

function workTypeTotalsFromSessions(sessions: SessionWithRatings[]): {
  deepWorkSeconds: number;
  routineSeconds: number;
  workType: WorkTypeLabel | null;
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

  let workType: WorkTypeLabel | null = null;
  if (hasDeepWork && hasRoutine) {
    workType = "Deep Work/Routine";
  } else if (hasDeepWork) {
    workType = "Deep Work";
  } else if (hasRoutine) {
    workType = "Routine";
  }

  return { deepWorkSeconds, routineSeconds, workType };
}

/**
 * Newest days with logged work first, never more than `MAX_RECENT_DAY_ROWS`.
 * Work type comes from each rated block; mixed days show Deep Work/Routine.
 */
export function buildRecentDayRows(
  sessions: SessionWithRatings[],
  todayIso: string,
  notesByDate: Record<string, string> = {}
): RecentDayRow[] {
  const byDate = new Map<string, SessionWithRatings[]>();
  for (const session of sessions) {
    const existing = byDate.get(session.date) ?? [];
    existing.push(session);
    byDate.set(session.date, existing);
  }

  const newestFirst = Array.from(byDate.keys()).sort((left, right) => {
    if (left < right) return 1;
    if (left > right) return -1;
    return 0;
  });

  const rows: RecentDayRow[] = [];
  for (const isoDate of newestFirst) {
    if (rows.length >= MAX_RECENT_DAY_ROWS) {
      break;
    }
    const daySessions = byDate.get(isoDate) ?? [];
    const summary = summarizeDayFromSessions(daySessions);
    if (summary.totalSeconds <= 0 && summary.ratingCount === 0 && summary.loadCount === 0) {
      continue;
    }
    const labels = dateLabelsForIso(isoDate, todayIso);
    const workTypeTotals = workTypeTotalsFromSessions(daySessions);
    rows.push({
      id: isoDate,
      dateLabel: labels.dateLabel,
      dateDetail: labels.dateDetail,
      workType: workTypeTotals.workType,
      deepWorkSeconds: workTypeTotals.deepWorkSeconds,
      routineSeconds: workTypeTotals.routineSeconds,
      load: summary.loadCount === 0 ? null : toLoadScore(summary.loadAvg),
      productivity: summary.ratingCount === 0 ? null : summary.productivityAvg,
      hours: formatFocusWorkHours(summary.totalSeconds),
      notes: notesByDate[isoDate] || null,
    });
  }
  return rows;
}
