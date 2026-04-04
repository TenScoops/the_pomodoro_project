import React, { useMemo } from "react";
import "./BarChart.css";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getMonthDayMetas, monthLineChartShowAllDaysTicks } from "./chartLabels";
import { useHoursWorkedChartData } from "../../hooks/useHoursWorkedChartData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

function buildGuestPlaceholderSeries(): { labels: string[]; hoursPerDay: number[] } {
  const now = new Date();
  const dayMetas = getMonthDayMetas(now.getFullYear(), now.getMonth(), "compact");
  return {
    labels: dayMetas.map((meta) => meta.label),
    hoursPerDay: dayMetas.map(() => 0),
  };
}

function buildHoursWorkedOptions(maxHours: number): ChartOptions<"line"> {
  const paddedMax = Math.max(1, maxHours * 1.15);
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = typeof context.parsed.y === "number" ? context.parsed.y : 0;
            return `Hours worked: ${value.toFixed(2)}`;
          },
        },
        titleFont: { family: "Roboto", size: 13 },
        bodyFont: { family: "Kalam", size: 14 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        ticks: {
          ...monthLineChartShowAllDaysTicks,
        },
      },
      y: {
        min: 0,
        suggestedMax: paddedMax,
        title: {
          display: true,
          text: "Hours worked",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        ticks: {
          color: "#111",
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
      },
    },
  };
}

const HoursWorkedChart = () => {
  const { loading, errorMessage, series, hasUser } = useHoursWorkedChartData();
  const guestSeries = useMemo(() => buildGuestPlaceholderSeries(), []);

  const displaySeries = hasUser ? series : guestSeries;
  const { labels, hoursPerDay } = displaySeries;

  const maxHours = useMemo(() => {
    if (hoursPerDay.length === 0) {
      return 0;
    }
    return Math.max(...hoursPerDay, 0);
  }, [hoursPerDay]);

  const options = useMemo(() => buildHoursWorkedOptions(maxHours), [maxHours]);

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Hours worked",
          data: hoursPerDay,
          borderColor: "#1e212d",
          backgroundColor: "rgba(30, 33, 45, 0.12)",
          fill: true,
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: false,
        },
      ],
    }),
    [labels, hoursPerDay]
  );

  const showEmptyHint =
    hasUser &&
    !loading &&
    !errorMessage &&
    hoursPerDay.length > 0 &&
    hoursPerDay.every((hours) => hours === 0);

  const showLoadingOnly = hasUser && loading;

  return (
    <div
      className="chart-container hours-worked-chart"
      style={{
        marginTop: "12px",
        width: "100vmin",
        height: "65vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {showLoadingOnly ? (
        <div className="chart-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="chart-spinner" />
          <p className="chart-loading-text">loading</p>
        </div>
      ) : (
        <>
          {hasUser && errorMessage ? (
            <p className="chart-status chart-status--error">{errorMessage}</p>
          ) : null}
          {showEmptyHint ? (
            <p className="chart-status chart-status--empty">
              No time logged for this month yet. Complete work blocks while signed in to see the line fill in.
            </p>
          ) : null}

          <div style={{ flex: 1, width: "100%", minHeight: "48vh", position: "relative", marginTop: "8px" }}>
            {labels.length > 0 ? <Line data={lineData} options={options} /> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default HoursWorkedChart;
