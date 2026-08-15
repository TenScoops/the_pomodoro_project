import React, { useMemo } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  DoughnutController,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { STATS_CHART_FONT } from "./statsChartTheme";
import { STATS_WORK_TYPE_SLICES, STATS_WORK_TYPE_TOTAL_HOURS } from "./statsBreakdownData";
import "./StatsBreakdowns.css";

ChartJS.register(ArcElement, DoughnutController, Tooltip);

export default function StatsWorkTypeBreakdown() {
  const isEmpty = STATS_WORK_TYPE_SLICES.length === 0;

  const doughnutData = useMemo(
    () => ({
      labels: STATS_WORK_TYPE_SLICES.map((slice) => slice.label),
      datasets: [
        {
          data: STATS_WORK_TYPE_SLICES.map((slice) => slice.hours),
          backgroundColor: STATS_WORK_TYPE_SLICES.map((slice) => slice.color),
          borderWidth: 0,
          hoverOffset: 2,
        },
      ],
    }),
    []
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
      {isEmpty ? (
        <p className="statsBreakdown__empty">No work-type hours to show yet.</p>
      ) : (
        <div className="statsBreakdown__workTypeBody">
          <div className="statsBreakdown__donutWrap">
            <Doughnut data={doughnutData} options={options} />
            <div className="statsBreakdown__donutCenter">
              <span className="statsBreakdown__donutTotal">{STATS_WORK_TYPE_TOTAL_HOURS}</span>
              <span className="statsBreakdown__donutCaption">Total Hours</span>
            </div>
          </div>
          <ul className="statsBreakdown__legend">
            {STATS_WORK_TYPE_SLICES.map((slice) => (
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
