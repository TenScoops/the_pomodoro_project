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
import type { ChartPeriodRange } from "./chartLabels";
import {
  getMonthDayMetas,
  getCurrentYearMonthLabels,
  monthLineChartShowAllDaysTicks,
  monthLineChartXAxisGrid,
  monthLineChartYearXAxisTicks,
} from "./chartLabels";
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

const HOURS_WORKED_LINE_STROKE = "#1e212d";
const HOURS_WORKED_AREA_FILL = "rgba(186, 230, 253, 0.55)";

function buildGuestPlaceholderSeries(
  timeRange: ChartPeriodRange,
  year: number,
  monthIndex0: number
): {
  labels: string[];
  hoursSeries: number[];
} {
  if (timeRange === "Month") {
    const dayMetas = getMonthDayMetas(year, monthIndex0, "full");
    return {
      labels: dayMetas.map((meta) => meta.label),
      hoursSeries: dayMetas.map(() => 0),
    };
  }
  const labels = getCurrentYearMonthLabels();
  return {
    labels,
    hoursSeries: labels.map(() => 0),
  };
}

function buildHoursWorkedLineOptions(
  timeRange: ChartPeriodRange,
  maxHours: number
): ChartOptions<"line"> {
  const paddedMax = Math.max(1, maxHours * 1.15);
  const isMonth = timeRange === "Month";
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
          text: isMonth ? "Date" : "Month",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        grid: {
          ...monthLineChartXAxisGrid,
        },
        ticks: {
          ...(isMonth ? monthLineChartShowAllDaysTicks : monthLineChartYearXAxisTicks),
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

export type HoursWorkedChartProps = {
  timeRange: ChartPeriodRange;
  year: number;
  monthIndex0: number;
};

const HoursWorkedChart = ({ timeRange, year, monthIndex0 }: HoursWorkedChartProps) => {
  const { loading, errorMessage, series, hasUser } = useHoursWorkedChartData(timeRange, year, monthIndex0);
  const guestSeries = useMemo(
    () => buildGuestPlaceholderSeries(timeRange, year, monthIndex0),
    [timeRange, year, monthIndex0]
  );

  const displaySeries = hasUser ? series : guestSeries;
  const { labels, hoursSeries } = displaySeries;

  const maxHours = useMemo(() => {
    if (hoursSeries.length === 0) {
      return 0;
    }
    return Math.max(...hoursSeries, 0);
  }, [hoursSeries]);

  const options = useMemo(
    () => buildHoursWorkedLineOptions(timeRange, maxHours),
    [timeRange, maxHours]
  );

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Hours worked",
          data: hoursSeries,
          borderColor: HOURS_WORKED_LINE_STROKE,
          backgroundColor: HOURS_WORKED_AREA_FILL,
          fill: true,
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: false,
        },
      ],
    }),
    [labels, hoursSeries]
  );

  const showEmptyHint =
    hasUser &&
    !loading &&
    !errorMessage &&
    hoursSeries.length > 0 &&
    hoursSeries.every((hours) => hours === 0);

  const showLoadingOnly = hasUser && loading;

  const emptyHintText =
    timeRange === "Month"
      ? "No time logged for this month yet. Complete work blocks while signed in to see the line fill in."
      : "No time logged for this year yet. Complete work blocks while signed in to see the line fill in.";

  return (
    <div
      className="chart-container hours-worked-chart"
      style={{
        marginTop: "8px",
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
          {showEmptyHint ? <p className="chart-status chart-status--empty">{emptyHintText}</p> : null}

          <div style={{ flex: 1, width: "100%", minHeight: "48vh", position: "relative", marginTop: "8px" }}>
            {labels.length > 0 ? <Line data={lineData} options={options} /> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default HoursWorkedChart;
