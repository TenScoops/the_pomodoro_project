import { useLayoutEffect, useState } from "react";
import { summarizeDayFromSessions } from "../components/chart/sessionChartData";
import {
  buildRecentDayRows,
  formatFocusLoadAvg,
  formatFocusProductivityAvg,
  formatFocusWorkHours,
  recentDaysRangeStart,
  type RecentDayRow,
} from "../components/focus/recentDaysData";
import { todayLocalISODate } from "../lib/calendarDates";
import { getDailyNotesInRange, getSessionsWithRatingsInRange } from "../services/pomoprogressService";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export type TodayFocusSummary = {
  hoursValue: string;
  loadValue: string;
  productivityValue: string;
  recentRows: RecentDayRow[];
};

const emptySummary: TodayFocusSummary = {
  hoursValue: "0",
  loadValue: "0",
  productivityValue: "0",
  recentRows: [],
};

/**
 * Today's hours / load / productivity plus up to four recent days with work.
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
      const todayIso = todayLocalISODate();
      const rangeStart = recentDaysRangeStart(todayIso);
      const [sessionsResult, notesResult] = await Promise.all([
        getSessionsWithRatingsInRange(rangeStart, todayIso),
        getDailyNotesInRange(rangeStart, todayIso),
      ]);
      if (cancelled) {
        return;
      }
      if (sessionsResult.error) {
        setSummary(emptySummary);
        return;
      }
      const sessions = sessionsResult.data ?? [];
      const notesByDate: Record<string, string> = {};
      if (!notesResult.error) {
        for (const row of notesResult.data) {
          notesByDate[row.date] = row.note;
        }
      }
      const todaySessions = sessions.filter((session) => session.date === todayIso);
      const { totalSeconds, productivityAvg, ratingCount, loadAvg, loadCount } =
        summarizeDayFromSessions(todaySessions);
      setSummary({
        hoursValue: formatFocusWorkHours(totalSeconds),
        loadValue: formatFocusLoadAvg(loadAvg, loadCount),
        productivityValue: formatFocusProductivityAvg(productivityAvg, ratingCount),
        recentRows: buildRecentDayRows(sessions, todayIso, notesByDate),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, chartDataRevision]);

  return summary;
}
