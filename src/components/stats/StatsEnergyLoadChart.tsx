import React, { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
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
  STATS_CHART_FONT,
  STATS_CHART_GREEN,
  STATS_CHART_ORANGE,
  buildStatsLineScaleOptions,
} from "./statsChartTheme";
import type { EnergyLoadChartPoint } from "./statsEnergyLoadSeries";
import { energyLoadSeriesHasData } from "./statsEnergyLoadSeries";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Tooltip, Legend);

interface StatsEnergyLoadChartProps {
  status: StatsPageStatus;
  points: EnergyLoadChartPoint[];
}

export default function StatsEnergyLoadChart({ status, points }: StatsEnergyLoadChartProps) {
  const labels = points.map((point) => point.label);
  const energySeries = points.map((point) => point.energy);
  const loadSeries = points.map((point) => point.load);
  const hasData = energyLoadSeriesHasData(points);

  const options = useMemo((): ChartOptions<"line"> => {
    return {
      maintainAspectRatio: false,
      spanGaps: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: STATS_CHART_FONT, size: 12 },
          bodyFont: { family: "Kalam", size: 13 },
          callbacks: {
            label: (context) => {
              const score = typeof context.parsed.y === "number" ? context.parsed.y : 0;
              return `${context.dataset.label}: ${score.toFixed(1)}`;
            },
          },
        },
      },
      scales: buildStatsLineScaleOptions(labels, {
        title: "",
        min: 1,
        max: 5,
        stepSize: 1,
      }),
    };
  }, [labels]);

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Energy",
          data: energySeries,
          borderColor: STATS_CHART_GREEN,
          backgroundColor: STATS_CHART_GREEN,
          fill: false,
          tension: 0,
          spanGaps: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#1e212d",
          pointBorderColor: STATS_CHART_GREEN,
          pointBorderWidth: 2,
        },
        {
          label: "Load",
          data: loadSeries,
          borderColor: STATS_CHART_ORANGE,
          backgroundColor: STATS_CHART_ORANGE,
          fill: false,
          tension: 0,
          spanGaps: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#1e212d",
          pointBorderColor: STATS_CHART_ORANGE,
          pointBorderWidth: 2,
        },
      ],
    }),
    [labels, energySeries, loadSeries]
  );

  let body: React.ReactNode;
  if (status === "loading") {
    body = <p className="statsPage__chartEmpty">Loading energy and load…</p>;
  } else if (status === "error") {
    body = <p className="statsPage__chartEmpty">Could not load energy and load.</p>;
  } else if (!hasData) {
    body = <p className="statsPage__chartEmpty">No energy or load to show yet.</p>;
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
        <div className="statsPage__chartTitleBlock">
          <h2 className="statsPage__chartTitle">Energy & Load Over Time</h2>
          <div className="statsPage__chartLegend">
            <span className="statsPage__chartLegendItem">
              <span className="statsPage__chartLegendDot statsPage__chartLegendDot--energy" aria-hidden />
              Energy
            </span>
            <span className="statsPage__chartLegendItem">
              <span className="statsPage__chartLegendDot statsPage__chartLegendDot--load" aria-hidden />
              Load
            </span>
          </div>
        </div>
        <button type="button" className="statsPage__chartGrain" aria-haspopup="listbox">
          Daily
          <HiOutlineChevronDown className="statsPage__periodChevron" aria-hidden />
        </button>
      </div>
      {body}
    </article>
  );
}
