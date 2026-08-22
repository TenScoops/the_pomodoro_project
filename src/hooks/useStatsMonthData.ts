import { useLayoutEffect, useState } from "react";
import { getAppNow } from "../lib/calendarDates";
import {
  getDailyNotesInRange,
  getEnergyLogsInRange,
  getSessionsWithRatingsForMonth,
  type EnergyLogRecord,
} from "../services/pomoprogressService";
import type { DailyNoteDateRow } from "../services/pomoprogressService/dailyNotes";
import { useSessionStore } from "../store/sessionStore";
import type { SessionWithRatings } from "../types/pomoprogress";
import { useAuth } from "./useAuth";

export type StatsPageStatus = "loading" | "error" | "ready";

export interface StatsMonthData {
  status: StatsPageStatus;
  sessions: SessionWithRatings[];
  energyLogs: EnergyLogRecord[];
  dailyNotes: DailyNoteDateRow[];
  rangeStart: string;
  rangeEnd: string;
}

function calendarMonthRange(year: number, monthOneThroughTwelve: number): {
  startDate: string;
  endDate: string;
} {
  const monthPadded = String(monthOneThroughTwelve).padStart(2, "0");
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = new Date(year, monthOneThroughTwelve, 0).getDate();
  const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

const emptyData = (rangeStart: string, rangeEnd: string): StatsMonthData => ({
  status: "ready",
  sessions: [],
  energyLogs: [],
  dailyNotes: [],
  rangeStart,
  rangeEnd,
});

/**
 * This calendar month’s sessions, energy logs, and Focus notes.
 * Refetches after a block is logged or today’s energy is saved.
 */
export function useStatsMonthData(): StatsMonthData {
  const { user, loading: authLoading } = useAuth();
  const chartDataRevision = useSessionStore((state) => state.chartDataRevision);
  const now = getAppNow();
  const year = now.getFullYear();
  const monthOneThroughTwelve = now.getMonth() + 1;
  const { startDate, endDate } = calendarMonthRange(year, monthOneThroughTwelve);

  const [data, setData] = useState<StatsMonthData>(() => ({
    ...emptyData(startDate, endDate),
    status: "loading",
  }));

  useLayoutEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      setData(emptyData(startDate, endDate));
      return;
    }

    let cancelled = false;
    setData((previous) => ({ ...previous, status: "loading", rangeStart: startDate, rangeEnd: endDate }));

    void (async () => {
      const [sessionsResult, energyResult, notesResult] = await Promise.all([
        getSessionsWithRatingsForMonth(year, monthOneThroughTwelve),
        getEnergyLogsInRange(startDate, endDate),
        getDailyNotesInRange(startDate, endDate),
      ]);
      if (cancelled) {
        return;
      }
      if (sessionsResult.error) {
        setData({
          status: "error",
          sessions: [],
          energyLogs: [],
          dailyNotes: [],
          rangeStart: startDate,
          rangeEnd: endDate,
        });
        return;
      }
      setData({
        status: "ready",
        sessions: sessionsResult.data ?? [],
        energyLogs: energyResult.error ? [] : energyResult.data,
        dailyNotes: notesResult.error ? [] : notesResult.data,
        rangeStart: startDate,
        rangeEnd: endDate,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, year, monthOneThroughTwelve, startDate, endDate, chartDataRevision]);

  return data;
}
