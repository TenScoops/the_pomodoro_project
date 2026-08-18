import { parseLocalISODate, shiftLocalISODate } from "./calendarDates";
import type { AnalysisMode } from "../types/aiAnalysis";

/** 12 calendar weeks including today. */
export const TRENDS_LOOKBACK_DAYS = 83;

/** 30 calendar days including today. */
export const ASK_LOOKBACK_DAYS = 29;

export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Monday of the week that contains `isoDate` (Sunday belongs to the previous Monday). */
export function mondayOfWeek(isoDate: string): string {
  const parsed = parseLocalISODate(isoDate);
  if (!parsed) {
    throw new Error(`Invalid local date: ${isoDate}`);
  }
  const weekdaySundayZero = parsed.getDay();
  const daysFromMonday = weekdaySundayZero === 0 ? 6 : weekdaySundayZero - 1;
  return shiftLocalISODate(isoDate, -daysFromMonday);
}

function inclusiveDayCount(range: DateRange): number {
  const start = parseLocalISODate(range.startDate);
  const end = parseLocalISODate(range.endDate);
  if (!start || !end) {
    throw new Error(`Invalid local date range: ${range.startDate}..${range.endDate}`);
  }
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function analysisDateRange(mode: AnalysisMode, localDate: string): DateRange {
  if (!parseLocalISODate(localDate)) {
    throw new Error(`Invalid local date: ${localDate}`);
  }
  if (mode === "today") {
    return { startDate: localDate, endDate: localDate };
  }
  if (mode === "week") {
    return { startDate: mondayOfWeek(localDate), endDate: localDate };
  }
  if (mode === "trends") {
    return {
      startDate: shiftLocalISODate(localDate, -TRENDS_LOOKBACK_DAYS),
      endDate: localDate,
    };
  }
  return {
    startDate: shiftLocalISODate(localDate, -ASK_LOOKBACK_DAYS),
    endDate: localDate,
  };
}

/** Same-length period immediately before the current range. This week compares to last Mon–Sun. */
export function comparisonDateRange(mode: AnalysisMode, localDate: string): DateRange {
  const current = analysisDateRange(mode, localDate);
  if (mode === "week") {
    const thisMonday = mondayOfWeek(localDate);
    return {
      startDate: shiftLocalISODate(thisMonday, -7),
      endDate: shiftLocalISODate(thisMonday, -1),
    };
  }
  const dayCount = inclusiveDayCount(current);
  return {
    startDate: shiftLocalISODate(current.startDate, -dayCount),
    endDate: shiftLocalISODate(current.startDate, -1),
  };
}

export function fetchDateWindow(
  mode: AnalysisMode,
  localDate: string
): {
  startDate: string;
  endDate: string;
  current: DateRange;
  previous: DateRange;
} {
  const current = analysisDateRange(mode, localDate);
  const previous = comparisonDateRange(mode, localDate);
  return {
    startDate: previous.startDate,
    endDate: current.endDate,
    current,
    previous,
  };
}
