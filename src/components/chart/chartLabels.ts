import { formatLocalISODate, getAppNow } from "../../lib/calendarDates";

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

/** Shared by Productivity, Hours worked, and Mood tracker modals (`by Month` / `by Year`). */
export type ChartPeriodRange = "Month" | "Year";

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
 * All days in the **current** calendar month (local), same label shape as **Productivity** month bars
 * (`formatChartDayLabel`: weekday + month + day, e.g. Wed, Apr 3).
 */
export function getCurrentMonthDayMetasLineCharts(): { iso: string; label: string }[] {
  const now = getAppNow();
  return getMonthDayMetas(now.getFullYear(), now.getMonth(), "full");
}

/** Twelve month labels for the current calendar year (matches productivity year bars). */
export function getCurrentYearMonthLabels(): string[] {
  const year = getAppNow().getFullYear();
  return getYearMonthMetas(year).map((meta) => meta.label);
}

/** Fewer categories than day view — all 12 month labels stay visible. */
export const monthLineChartYearXAxisTicks = {
  autoSkip: false,
  color: "#111",
  maxRotation: 0,
  minRotation: 0,
  font: { family: "Roboto, sans-serif", size: 11 },
} as const;

/**
 * Chart.js category-axis settings so every day in the month is drawn (no auto-skipping).
 * Use with one label per calendar day; rotate slightly so 28–31 ticks stay readable.
 */
export const monthLineChartShowAllDaysTicks = {
  autoSkip: false,
  color: "#111",
  maxRotation: 60,
  minRotation: 50,
  font: { family: "Roboto, sans-serif", size: 9 },
} as const;

/** Vertical grid at each day so every calendar slot is visible alongside tick labels. */
export const monthLineChartXAxisGrid = {
  display: true,
  color: "rgba(0, 0, 0, 0.06)",
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
