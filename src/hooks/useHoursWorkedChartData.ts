import { useLayoutEffect, useState } from "react";
import { buildMonthHoursLineSeriesFromSessions } from "../components/chart/sessionChartData";
import { getSessionsWithRatingsForMonth } from "../services/pomoprogressService";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export type HoursWorkedSeriesState = {
  labels: string[];
  hoursPerDay: number[];
};

const emptySeries: HoursWorkedSeriesState = { labels: [], hoursPerDay: [] };

/**
 * Current calendar month: one point per day, hours worked = sum of session `total_time_worked` that day.
 */
export function useHoursWorkedChartData() {
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

    const now = new Date();
    const year = now.getFullYear();
    const monthIndex0 = now.getMonth();
    const monthOneThroughTwelve = monthIndex0 + 1;

    void (async () => {
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
    })();

    return () => {
      cancelled = true;
    };
  }, [user, chartDataRevision]);

  return {
    loading,
    errorMessage,
    series,
    hasUser: Boolean(user),
  };
}
