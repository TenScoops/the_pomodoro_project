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
import type { StatsPageStatus } from "../../hooks/useStatsMonthData";
import {
  STATS_CHART_BLUE,
  STATS_CHART_BLUE_FILL,
  STATS_CHART_FONT,
  buildStatsLineScaleOptions,
} from "./statsChartTheme";
import type { HoursOverTimePoint } from "./statsHoursOverTimeSeries";
import { hoursAxisMax, hoursOverTimeSeriesHasData } from "./statsHoursOverTimeSeries";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Legend, Filler);

interface StatsHoursOverTimeChartProps {
  status: StatsPageStatus;
  points: HoursOverTimePoint[];
}

export default function StatsHoursOverTimeChart({ status, points }: StatsHoursOverTimeChartProps) {
  const labels = points.map((point) => point.label);
  const hoursSeries = points.map((point) => point.hours);
  const hasData = hoursOverTimeSeriesHasData(points);
  const yMax = hoursAxisMax(hoursSeries);

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
        max: yMax,
        stepSize: 2,
        formatTick: (tickValue) => {
          if (tickValue === 0) return "0";
          return `${tickValue}h`;
        },
      }),
    };
  }, [labels, yMax]);

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
          // Solid dots match the Hours Over Time mockup (energy/load uses hollow rings).
          pointBackgroundColor: STATS_CHART_BLUE,
          pointBorderColor: STATS_CHART_BLUE,
          pointBorderWidth: 0,
        },
      ],
    }),
    [labels, hoursSeries]
  );

  let body: React.ReactNode;
  if (status === "loading") {
    body = <p className="statsPage__chartEmpty">Loading hours…</p>;
  } else if (status === "error") {
    body = <p className="statsPage__chartEmpty">Could not load hours.</p>;
  } else if (!hasData) {
    body = <p className="statsPage__chartEmpty">No hours to show yet.</p>;
  } else {
    body = (
      <div className="statsPage__chartCanvas">
        <Line data={lineData} options={options} />
      </div>
    );
  }

  return (
    <article className="statsPage__chartCard">
      <div className="statsPage__chartHeader">
        <h2 className="statsPage__chartTitle">Hours Over Time</h2>
        <button type="button" className="statsPage__chartGrain" aria-haspopup="listbox">
          Daily
          <HiOutlineChevronDown className="statsPage__periodChevron" aria-hidden />
        </button>
      </div>
      {body}
    </article>
  );
}
