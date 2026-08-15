import { useLayoutEffect, useState } from "react";
import { summarizeDayFromSessions } from "../components/chart/sessionChartData";
import { todayLocalISODate } from "../lib/calendarDates";
import { getSessionsWithRatingsForDate } from "../services/pomoprogressService";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export type TodayFocusSummary = {
  hoursValue: string;
  productivityValue: string;
};

const emptySummary: TodayFocusSummary = {
  hoursValue: "0",
  productivityValue: "0",
};

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

/**
 * Today's total work hours and productivity average from rated sessions.
 * Refetches when a block is logged (`chartDataRevision`).
 */
export function useTodayFocusSummary(): TodayFocusSummary {
  const { user } = useAuth();
  const chartDataRevision = useSessionStore((state) => state.chartDataRevision);
  const [summary, setSummary] = useState<TodayFocusSummary>(emptySummary);

  useLayoutEffect(() => {
    if (!user) {
      setSummary(emptySummary);
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error } = await getSessionsWithRatingsForDate(todayLocalISODate());
      if (cancelled) {
        return;
      }
      if (error) {
        setSummary(emptySummary);
        return;
      }
      const { totalSeconds, productivityAvg, ratingCount } = summarizeDayFromSessions(data ?? []);
      setSummary({
        hoursValue: formatFocusWorkHours(totalSeconds),
        productivityValue: formatFocusProductivityAvg(productivityAvg, ratingCount),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, chartDataRevision]);

  return summary;
}
