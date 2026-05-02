import React, { useMemo } from "react";
import "./BarChart/BarChart.css";
import {
  CategoryScale,
  Chart as ChartJS,
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
  getCurrentMonthDayMetasLineCharts,
  getCurrentYearMonthLabels,
  monthLineChartShowAllDaysTicks,
  monthLineChartXAxisGrid,
  monthLineChartYearXAxisTicks,
} from "./chartLabels";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend);

function buildMoodTrackerOptions(timeRange: ChartPeriodRange): ChartOptions<"line"> {
  const isMonth = timeRange === "Month";
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const first = items[0];
            if (!first) {
              return "";
            }
            const chartLabels = first.chart.data.labels;
            const label = chartLabels?.[first.dataIndex];
            return typeof label === "string" ? label : "";
          },
          label: () => "Mood data not available yet",
        },
        titleFont: { family: "Roboto", size: 13 },
        bodyFont: { family: "Roboto", size: 12 },
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
        title: {
          display: true,
          text: "Mood (not defined yet)",
          color: "#111",
          font: { family: "Roboto, sans-serif", size: 13 },
        },
        min: 0,
        max: 1,
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(0,0,0,0.08)",
        },
      },
    },
  };
}

export type MoodTrackerChartProps = {
  timeRange: ChartPeriodRange;
};

/**
 * Placeholder mood series: x-axis matches Hours worked / Productivity for the same period.
 */
const MoodTrackerChart = ({ timeRange }: MoodTrackerChartProps) => {
  const labels = useMemo(() => {
    if (timeRange === "Month") {
      return getCurrentMonthDayMetasLineCharts().map((meta) => meta.label);
    }
    return getCurrentYearMonthLabels();
  }, [timeRange]);

  const options = useMemo(() => buildMoodTrackerOptions(timeRange), [timeRange]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Mood",
          data: labels.map(() => null) as (number | null)[],
          borderColor: "transparent",
          backgroundColor: "transparent",
          pointRadius: 0,
          spanGaps: false,
        },
      ],
    }),
    [labels]
  );

  return (
    <div
      className="chart-container mood-tracker-chart"
      style={{
        marginTop: "8px",
        width: "100vmin",
        height: "58vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <p
        style={{
          margin: "0 16px 12px",
          fontFamily: "Roboto, sans-serif",
          fontSize: "14px",
          color: "#444",
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        Mood tracking will appear here. The vertical scale is not set yet.
      </p>
      <div style={{ flex: 1, width: "100%", minHeight: "42vh", position: "relative" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default MoodTrackerChart;
