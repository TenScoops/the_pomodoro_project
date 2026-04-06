/**
 * Placeholder productivity series for charts (e.g. guests / users not logged in).
 * BarChart imports these builders; swap in real Supabase-backed data when ready.
 */

import { getAppNow } from "../../lib/calendarDates";

export type ChartPoint = {
  x: string;
  y: string | number;
  length: number;
  /** Completed sessions in the bucket (draft sessions are excluded from live charts). */
  sessions: number;
  backgroundColor: string;
  /** Set for Supabase-backed charts; tooltip shows total blocks completed in the bucket. */
  blocksCompleted?: number;
};

export type DummyBarDataset = {
  label: string;
  data: ChartPoint[];
  backgroundColor: string[];
  borderColor: string;
  borderWidth: number;
};

function formatDateLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function formatMonthLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short" };
  return date.toLocaleDateString(undefined, options);
}

function monthDayLabelsForCurrentMonth(): string[] {
  const currentDate = getAppNow();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const datesInMonth: string[] = [];

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
    datesInMonth.push(formatDateLabel(new Date(day)));
  }

  return datesInMonth;
}

function yearMonthLabels(): string[] {
  const currentDate = getAppNow();
  const currentYear = currentDate.getFullYear();
  const monthsInYear: string[] = [];

  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 1);
    monthsInYear.push(formatMonthLabel(date));
  }

  return monthsInYear;
}

/** Bar color by productivity average (1–10 scale), matching the previous BarChart styling. */
export function getProductivityBarColor(productivityAvg: number): string {
  if (productivityAvg >= 0 && productivityAvg < 1.5) {
    return "rgb(170, 0, 0)";
  }
  if (productivityAvg >= 1.5 && productivityAvg < 2.5) {
    return "rgb(205, 0, 0)";
  }
  if (productivityAvg >= 2.5 && productivityAvg < 3.5) {
    return "rgb(255, 34, 0)";
  }
  if (productivityAvg >= 3.5 && productivityAvg < 4.5) {
    return "orangered";
  }
  if (productivityAvg >= 4.5 && productivityAvg < 5.5) {
    return "rgb(255, 136, 0)";
  }
  if (productivityAvg >= 5.5 && productivityAvg < 6.5) {
    return "rgb(255, 191, 0)";
  }
  if (productivityAvg >= 6.5 && productivityAvg < 7.5) {
    return "yellow";
  }
  if (productivityAvg >= 7.5 && productivityAvg < 8.3) {
    return "rgb(184, 255, 18)";
  }
  if (productivityAvg >= 8.3 && productivityAvg < 9) {
    return "rgb(2, 188, 5)";
  }
  if (productivityAvg >= 9 && productivityAvg <= 10) {
    return "rgb(0, 228, 4)";
  }
  return "";
}

export function buildDummyMonthBarDataset(): DummyBarDataset {
  const monthLabels = monthDayLabelsForCurrentMonth();

  const monthData: ChartPoint[] = Array.from({ length: monthLabels.length }, (_, index) => {
    const productivityAvg = Number((Math.random() * 10).toFixed(2));
    const length = Math.floor(Math.random() * 100) + 1;
    const sessions = Math.floor(Math.random() * 10) + 1;
    const backgroundColor = getProductivityBarColor(productivityAvg);

    return {
      x: monthLabels[index],
      y: productivityAvg,
      length,
      sessions,
      backgroundColor,
    };
  });

  return {
    label: "Productivity avg",
    data: monthData,
    backgroundColor: monthData.map((dataPoint) => dataPoint.backgroundColor),
    borderColor: "black",
    borderWidth: 3.5,
  };
}

export function buildDummyYearBarDataset(): DummyBarDataset {
  const yearLabels = yearMonthLabels();

  const yearData: ChartPoint[] = yearLabels.map((month) => {
    const productivityAvg = Number((Math.random() * 10).toFixed(2));
    const length = Math.floor(Math.random() * 100) + 1;
    const sessions = Math.floor(Math.random() * 10) + 1;
    const backgroundColor = getProductivityBarColor(productivityAvg);

    return {
      x: month,
      y: productivityAvg,
      length,
      sessions,
      backgroundColor,
    };
  });

  return {
    label: "Productivity avg",
    data: yearData,
    backgroundColor: yearData.map((dataPoint) => dataPoint.backgroundColor),
    borderColor: "black",
    borderWidth: 3.5,
  };
}
