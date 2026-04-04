import { formatLocalISODate } from "../../lib/calendarDates";

/** Single-line label for a calendar day (matches dummy chart / locale). */
export function formatChartDayLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

/** Short day label for month line charts when every day is shown (e.g. "Apr 3"). */
export function formatChartMonthDayCompact(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function monthDateRangeInclusive(year: number, monthOneThroughTwelve: number): { startDate: string; endDate: string } {
  const monthPadded = String(monthOneThroughTwelve).padStart(2, "0");
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = new Date(year, monthOneThroughTwelve, 0);
  const dayPadded = String(lastDay.getDate()).padStart(2, "0");
  const endDate = `${year}-${monthPadded}-${dayPadded}`;
  return { startDate, endDate };
}

export type MonthDayLabelStyle = "full" | "compact";

/** Each day in the month with a stable ISO key for joining session rows. */
export function getMonthDayMetas(
  year: number,
  monthIndex0: number,
  labelStyle: MonthDayLabelStyle = "full"
): { iso: string; label: string }[] {
  const firstDay = new Date(year, monthIndex0, 1);
  const lastDay = new Date(year, monthIndex0 + 1, 0);
  const result: { iso: string; label: string }[] = [];

  for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
    const copy = new Date(day);
    const label =
      labelStyle === "compact" ? formatChartMonthDayCompact(copy) : formatChartDayLabel(copy);
    result.push({
      iso: formatLocalISODate(copy),
      label,
    });
  }

  return result;
}

/**
 * Chart.js category-axis settings so every day in the month is drawn (no auto-skipping).
 * Use with one label per calendar day; rotate slightly so 28–31 ticks stay readable.
 */
export const monthLineChartShowAllDaysTicks = {
  autoSkip: false,
  color: "#111",
  maxRotation: 55,
  minRotation: 45,
  font: { family: "Roboto, sans-serif", size: 10 },
} as const;

/** Twelve month buckets for a calendar year (for filtering session `date`). */
export function getYearMonthMetas(
  year: number
): { label: string; startDate: string; endDate: string }[] {
  const result: { label: string; startDate: string; endDate: string }[] = [];
  for (let month = 1; month <= 12; month++) {
    const start = new Date(year, month - 1, 1);
    const { startDate, endDate } = monthDateRangeInclusive(year, month);
    result.push({
      label: start.toLocaleDateString(undefined, { month: "short" }),
      startDate,
      endDate,
    });
  }
  return result;
}
