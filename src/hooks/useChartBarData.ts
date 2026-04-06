import { useLayoutEffect, useState } from "react";
import type { ChartPeriodRange } from "../components/chart/chartLabels";
import type { DummyBarDataset } from "../components/chart/dummyData";
import {
  buildMonthBarDatasetFromSessions,
  buildYearBarDatasetFromSessions,
} from "../components/chart/sessionChartData";
import {
  getSessionsWithRatingsForMonth,
  getSessionsWithRatingsForYear,
} from "../services/pomoprogressService";
import { getAppNow } from "../lib/calendarDates";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

export function useChartBarData(theTime: ChartPeriodRange) {
  const { user } = useAuth();
  const chartDataRevision = useSessionStore((state) => state.chartDataRevision);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveDataset, setLiveDataset] = useState<DummyBarDataset | null>(null);

  useLayoutEffect(() => {
    if (!user) {
      setLoading(false);
      setErrorMessage(null);
      setLiveDataset(null);
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
      if (theTime === "Month") {
        const { data, error } = await getSessionsWithRatingsForMonth(year, monthOneThroughTwelve);
        if (cancelled) {
          return;
        }
        if (error) {
          setErrorMessage(error.message);
          setLiveDataset(null);
          setLoading(false);
          return;
        }
        setLiveDataset(buildMonthBarDatasetFromSessions(data ?? [], year, monthIndex0));
        setLoading(false);
        return;
      }

      const { data, error } = await getSessionsWithRatingsForYear(year);
      if (cancelled) {
        return;
      }
      if (error) {
        setErrorMessage(error.message);
        setLiveDataset(null);
        setLoading(false);
        return;
      }
      setLiveDataset(buildYearBarDatasetFromSessions(data ?? [], year));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, theTime, chartDataRevision]);

  return {
    loading,
    errorMessage,
    liveDataset,
    hasUser: Boolean(user),
  };
}
