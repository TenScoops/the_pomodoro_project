import React, { useMemo } from "react";
import "./BarChart.css";
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
import { getMonthDayMetas, monthLineChartShowAllDaysTicks } from "./chartLabels";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend);

function buildMoodTrackerOptions(): ChartOptions<"line"> {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
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

/**
 * Placeholder mood series: dates on the x-axis; y-axis reserved until mood data exists.
 */
const MoodTrackerChart = () => {
  const labels = useMemo(() => {
    const now = new Date();
    return getMonthDayMetas(now.getFullYear(), now.getMonth(), "compact").map((meta) => meta.label);
  }, []);
  const options = useMemo(() => buildMoodTrackerOptions(), []);

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
        marginTop: "12px",
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
