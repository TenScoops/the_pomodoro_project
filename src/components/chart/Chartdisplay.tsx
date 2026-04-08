import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./Chartdisplay.css";
import type { ChartPeriodRange } from "./chartLabels";
import { useSessionStore } from "../../store/sessionStore";
import BarChart from "./BarChart";
import HoursWorkedChart from "./HoursWorkedChart";
import { formatLocalISODate, getAppNow } from "../../lib/calendarDates";
import {
  getLatestRatedSessionDateBefore,
  getSessionsWithRatingsForDate,
} from "../../services/pomoprogressService";
import HighProductivityToast from "../notifications/HighProductivityToast";
import { useAuth } from "../../hooks/useAuth";
// import MoodTrackerChart from "./MoodTrackerChart";

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
  const setData = useSessionStore((s) => s.setData);
  const { user } = useAuth();

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
      borderRadius: "20px",
      padding: "0",
      border: "solid 3px black",
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
          </div>

          <div className="chart-view-area">
            {chartView === "productivity" ? (
              <BarChart timeRange={period} />
            ) : (
              <HoursWorkedChart timeRange={period} />
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
