import { useLayoutEffect, useState } from "react";
import type { ChartPeriodRange } from "../components/chart/chartLabels";
import {
  buildMonthHoursLineSeriesFromSessions,
  buildYearHoursLineSeriesFromSessions,
} from "../components/chart/sessionChartData";
import {
  getSessionsWithRatingsForMonth,
  getSessionsWithRatingsForYear,
} from "../services/pomoprogressService";
import { getAppNow } from "../lib/calendarDates";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export type HoursWorkedSeriesState = {
  labels: string[];
  hoursSeries: number[];
};

const emptySeries: HoursWorkedSeriesState = { labels: [], hoursSeries: [] };

/**
 * Hours worked line chart: current calendar month (per day) or year (per month), from Supabase.
 */
export function useHoursWorkedChartData(timeRange: ChartPeriodRange) {
  const { user } = useAuth();
  const chartDataRevision = useSessionStore((state) => state.chartDataRevision);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [series, setSeries] = useState<HoursWorkedSeriesState>(emptySeries);

  useLayoutEffect(() => {
    if (!user) {
      setLoading(false);
      setErrorMessage(null);
      setSeries(emptySeries);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    const now = getAppNow();
    const year = now.getFullYear();
    const monthIndex0 = now.getMonth();
    const monthOneThroughTwelve = monthIndex0 + 1;

    void (async () => {
      if (timeRange === "Month") {
        const { data, error } = await getSessionsWithRatingsForMonth(year, monthOneThroughTwelve);
        if (cancelled) {
          return;
        }
        if (error) {
          setErrorMessage(error.message);
          setSeries(emptySeries);
          setLoading(false);
          return;
        }
        setSeries(buildMonthHoursLineSeriesFromSessions(data ?? [], year, monthIndex0));
        setLoading(false);
        return;
      }

      const { data, error } = await getSessionsWithRatingsForYear(year);
      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(error.message);
        setSeries(emptySeries);
        setLoading(false);
        return;
      }
      setSeries(buildYearHoursLineSeriesFromSessions(data ?? [], year));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, timeRange, chartDataRevision]);

  return {
    loading,
    errorMessage,
    series,
    hasUser: Boolean(user),
  };
}
