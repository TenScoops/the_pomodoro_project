import React, { useMemo } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { StatsPageStatus } from "../../hooks/useStatsMonthData";
import { STATS_CHART_FONT } from "./statsChartTheme";
import type { StatsWorkTypeSlice } from "./statsBreakdownData";
import { monthHasWorkTypeHours } from "./statsBreakdownData";
import "./StatsBreakdowns.css";

ChartJS.register(ArcElement, DoughnutController, Tooltip);

interface StatsWorkTypeBreakdownProps {
  status: StatsPageStatus;
  slices: StatsWorkTypeSlice[];
  totalHours: number;
}

export default function StatsWorkTypeBreakdown({
  status,
  slices,
  totalHours,
}: StatsWorkTypeBreakdownProps) {
  const hasHours = monthHasWorkTypeHours(slices);

  const doughnutData = useMemo(
    () => ({
      labels: slices.map((slice) => slice.label),
      datasets: [
        {
          data: slices.map((slice) => slice.hours),
          backgroundColor: slices.map((slice) => slice.color),
          borderWidth: 0,
          hoverOffset: 2,
        },
      ],
    }),
    [slices]
  );

  const options = useMemo(
    (): ChartOptions<"doughnut"> => ({
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: STATS_CHART_FONT, size: 12 },
          bodyFont: { family: "Kalam", size: 13 },
          callbacks: {
            label: (context) => {
              const hoursValue = typeof context.parsed === "number" ? context.parsed : 0;
              return `${context.label}: ${hoursValue.toFixed(1)}h`;
            },
          },
        },
      },
    }),
    []
  );

  return (
    <article className="statsBreakdown">
      <h2 className="statsBreakdown__heading">Breakdown by Work Type</h2>
      {status === "loading" ? (
        <p className="statsBreakdown__empty">Loading work-type hours…</p>
      ) : status === "error" ? (
        <p className="statsBreakdown__empty">Could not load work-type hours.</p>
      ) : !hasHours ? (
        <p className="statsBreakdown__empty">No work-type hours to show yet.</p>
      ) : (
        <div className="statsBreakdown__workTypeBody">
          <div className="statsBreakdown__donutWrap">
            <Doughnut data={doughnutData} options={options} />
            <div className="statsBreakdown__donutCenter">
              <span className="statsBreakdown__donutTotal">{totalHours}</span>
              <span className="statsBreakdown__donutCaption">Total Hours</span>
            </div>
          </div>
          <ul className="statsBreakdown__legend">
            {slices.map((slice) => (
              <li key={slice.id} className="statsBreakdown__legendRow">
                <span className="statsBreakdown__legendLabel">
                  <span
                    className="statsBreakdown__legendDot"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden
                  />
                  {slice.label}
                </span>
                <span className="statsBreakdown__legendHours">{slice.hours.toFixed(1)}h</span>
                <span className="statsBreakdown__legendPercent">{slice.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
