import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./Chartdisplay.css";
import type { ChartPeriodRange } from "../chartLabels";
import { useSessionStore } from "../../../store/sessionStore";
import BarChart from "../BarChart";
import HoursWorkedChart from "../HoursWorkedChart";
import { formatLocalISODate, getAppNow } from "../../../lib/calendarDates";
import {
  getLatestRatedSessionDateBefore,
  getSessionsWithRatingsForYear,
  getSessionsWithRatingsForDate,
} from "../../../services/pomoprogressService";
import HighProductivityToast from "../../notifications/HighProductivityToast";
import { useAuth } from "../../../hooks/useAuth";
// import MoodTrackerChart from "../MoodTrackerChart";

type ChartView = "productivity" | "hoursWorked";
const PRODUCTIVITY_TOAST_LAST_DISMISSED_KEY = "pomoprogress_high_productivity_toast_last_dismissed_date";
const HIGH_PRODUCTIVITY_THRESHOLD = 8.3;

function averageRatingsForSessions(
  sessions: Array<{ block_ratings: Array<{ rating: number }> | null }>
): number {
  const allRatings: number[] = [];
  for (const session of sessions) {
    for (const ratingRow of session.block_ratings ?? []) {
      allRatings.push(ratingRow.rating);
    }
  }
  if (allRatings.length === 0) {
    return 0;
  }
  const total = allRatings.reduce((runningTotal, ratingValue) => runningTotal + ratingValue, 0);
  return Number((total / allRatings.length).toFixed(2));
}

const Chartdisplay = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [chartView, setChartView] = useState<ChartView>("productivity");
  const [period, setPeriod] = useState<ChartPeriodRange>("Month");
  const [showHighProductivityToast, setShowHighProductivityToast] = useState(false);
  const [monthsWithData, setMonthsWithData] = useState<Set<number>>(new Set());
  const setData = useSessionStore((s) => s.setData);
  const { user } = useAuth();
  const now = getAppNow();
  const selectedYear = now.getFullYear();
  const [selectedMonthIndex0, setSelectedMonthIndex0] = useState<number>(now.getMonth());

  const customStyles = {
    overlay: {
      backgroundColor: "transparent",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "rgba(255, 255, 255)",
      height: "78vh",
      width: "101vmin",
      borderRadius: "0",
      padding: "0",
      border: "1px solid #000",
      outline: "none",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setData(false);
  };

  useEffect(() => {
    if (!modalOpen || !user) {
      setShowHighProductivityToast(false);
      return;
    }

    const todayIso = formatLocalISODate(getAppNow());
    const lastDismissedDate = window.localStorage.getItem(PRODUCTIVITY_TOAST_LAST_DISMISSED_KEY);
    if (lastDismissedDate === todayIso) {
      setShowHighProductivityToast(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      const { date: latestActiveDateBeforeToday, error: latestDateError } =
        await getLatestRatedSessionDateBefore(todayIso);
      if (cancelled || latestDateError || !latestActiveDateBeforeToday) {
        setShowHighProductivityToast(false);
        return;
      }

      const { data: lastActiveSessions, error: lastActiveError } =
        await getSessionsWithRatingsForDate(latestActiveDateBeforeToday);
      if (cancelled || lastActiveError) {
        setShowHighProductivityToast(false);
        return;
      }

      const lastActiveAverage = averageRatingsForSessions(lastActiveSessions ?? []);
      setShowHighProductivityToast(lastActiveAverage >= HIGH_PRODUCTIVITY_THRESHOLD);
    })();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, user]);

  useEffect(() => {
    if (!modalOpen || !user) {
      setMonthsWithData(new Set());
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data, error } = await getSessionsWithRatingsForYear(selectedYear);
      if (cancelled || error) {
        return;
      }
      const next = new Set<number>();
      for (const session of data ?? []) {
        if ((session.block_ratings?.length ?? 0) <= 0) {
          continue;
        }
        const [yearText, monthText] = session.date.split("-");
        const sessionYear = Number(yearText);
        const monthOneThroughTwelve = Number(monthText);
        if (sessionYear === selectedYear && Number.isInteger(monthOneThroughTwelve)) {
          next.add(monthOneThroughTwelve - 1);
        }
      }
      setMonthsWithData(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, user, selectedYear]);

  const currentMonthIndex0 = selectedYear === now.getFullYear() ? now.getMonth() : 11;
  const selectableMonthIndexes = Array.from(
    new Set<number>([selectedMonthIndex0, currentMonthIndex0, ...Array.from(monthsWithData)])
  ).sort((a, b) => a - b);
  const showMonthNavigator = period === "Month" && monthsWithData.size >= 1;

  const prevMonthWithData = (() => {
    for (let month = selectedMonthIndex0 - 1; month >= 0; month -= 1) {
      if (monthsWithData.has(month)) {
        return month;
      }
    }
    return null;
  })();

  /** Jump back to the current month (even if empty), otherwise next month that has ratings. */
  const nextNavigableMonth = (() => {
    if (selectedMonthIndex0 < currentMonthIndex0) {
      return currentMonthIndex0;
    }
    for (let month = selectedMonthIndex0 + 1; month < 12; month += 1) {
      if (monthsWithData.has(month)) {
        return month;
      }
    }
    return null;
  })();

  const dismissHighProductivityToast = () => {
    window.localStorage.setItem(
      PRODUCTIVITY_TOAST_LAST_DISMISSED_KEY,
      formatLocalISODate(getAppNow())
    );
    setShowHighProductivityToast(false);
  };

  return (
    <>
      <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
        <button type="button" onClick={() => closeModal()} className="Chart-close-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="chart-modal-inner">
          <div className="chart-toolbar">
            <div className="chart-toolbar-cluster">
              <label className="chart-view-label" htmlFor="chart-view-select">
                View
              </label>
              <select
                id="chart-view-select"
                className="chart-view-select"
                value={chartView}
                onChange={(event) => setChartView(event.target.value as ChartView)}
                aria-label="Choose chart: productivity or hours worked"
              >
                <option value="productivity">Productivity</option>
                <option value="hoursWorked">Hours worked</option>
                {/* <option value="mood">Mood Tracker</option> */}
              </select>
            </div>

            <div className="chart-toolbar-cluster chart-toolbar-cluster--period">
              <span className="chart-view-label" id="chart-period-label">
                Period
              </span>
              <div className="chart-period-toggle" role="group" aria-labelledby="chart-period-label">
                <button
                  type="button"
                  className={
                    period === "Month" ? "chart-period-button chart-period-button--active" : "chart-period-button"
                  }
                  onClick={() => setPeriod("Month")}
                >
                  by Month
                </button>
                <button
                  type="button"
                  className={period === "Year" ? "chart-period-button chart-period-button--active" : "chart-period-button"}
                  onClick={() => setPeriod("Year")}
                  title="Current calendar year"
                >
                  by Year
                </button>
              </div>
            </div>

            {showMonthNavigator && (
              <div className="chart-toolbar-cluster chart-toolbar-cluster--monthNav" aria-label="Month navigator">
                <span className="chart-view-label" id="chart-period-label">
                  Month
                </span>
                <select
                  className="chart-month-nav-select"
                  value={selectedMonthIndex0}
                  onChange={(event) => setSelectedMonthIndex0(Number(event.target.value))}
                  aria-label="Select month"
                >
                  {selectableMonthIndexes.map((monthIndex0) => (
                    <option key={monthIndex0} value={monthIndex0}>
                      {new Date(selectedYear, monthIndex0, 1).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="chart-month-nav-button"
                  onClick={() => {
                    if (prevMonthWithData !== null) {
                      setSelectedMonthIndex0(prevMonthWithData);
                    }
                  }}
                  aria-label="Previous month with data"
                >
                  &#x2039;
                </button>
                <button
                  type="button"
                  className="chart-month-nav-button"
                  onClick={() => {
                    if (nextNavigableMonth !== null) {
                      setSelectedMonthIndex0(nextNavigableMonth);
                    }
                  }}
                  aria-label="Next month"
                >
                  &#x203A;
                </button>
              </div>
            )}
          </div>

          <div className="chart-view-area">
            {chartView === "productivity" ? (
              <BarChart
                timeRange={period}
                year={selectedYear}
                monthIndex0={selectedMonthIndex0}
              />
            ) : (
              <HoursWorkedChart
                timeRange={period}
                year={selectedYear}
                monthIndex0={selectedMonthIndex0}
              />
            )}
            {/* chartView === "mood" ? <MoodTrackerChart timeRange={period} /> : ... */}
          </div>
        </div>
      </Modal>

      <HighProductivityToast show={showHighProductivityToast} onDismiss={dismissHighProductivityToast} />
    </>
  );
};

export default Chartdisplay;
