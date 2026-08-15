import React, { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { STATS_DAILY_POINTS } from "./statsData";
import {
  STATS_CHART_BLUE,
  STATS_CHART_BLUE_FILL,
  STATS_CHART_FONT,
  buildStatsLineScaleOptions,
} from "./statsChartTheme";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Legend, Filler);

export default function StatsHoursOverTimeChart() {
  const labels = STATS_DAILY_POINTS.map((point) => point.label);
  const hoursSeries = STATS_DAILY_POINTS.map((point) => point.hours);
  const isEmpty = STATS_DAILY_POINTS.length === 0;

  const options = useMemo((): ChartOptions<"line"> => {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: STATS_CHART_FONT, size: 12 },
          bodyFont: { family: "Kalam", size: 13 },
          callbacks: {
            label: (context) => {
              const hoursValue = typeof context.parsed.y === "number" ? context.parsed.y : 0;
              return `Hours: ${hoursValue.toFixed(1)}`;
            },
          },
        },
      },
      scales: buildStatsLineScaleOptions(labels, {
        title: "Hours",
        min: 0,
        max: 8,
        stepSize: 2,
        formatTick: (tickValue) => {
          if (tickValue === 0) return "0";
          return `${tickValue}h`;
        },
      }),
    };
  }, [labels]);

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Hours",
          data: hoursSeries,
          borderColor: STATS_CHART_BLUE,
          backgroundColor: STATS_CHART_BLUE_FILL,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#1e212d",
          pointBorderColor: STATS_CHART_BLUE,
          pointBorderWidth: 2,
        },
      ],
    }),
    [labels, hoursSeries]
  );

  return (
    <article className="statsPage__chartCard">
      <div className="statsPage__chartHeader">
        <h2 className="statsPage__chartTitle">Hours Over Time</h2>
        <button type="button" className="statsPage__chartGrain" aria-haspopup="listbox">
          Daily
          <HiOutlineChevronDown className="statsPage__periodChevron" aria-hidden />
        </button>
      </div>
      {isEmpty ? (
        <p className="statsPage__chartEmpty">No hours to show yet.</p>
      ) : (
        <div className="statsPage__chartCanvas">
          <Line data={lineData} options={options} />
        </div>
      )}
    </article>
  );
}
