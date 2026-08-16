import React from "react";
import type { StatsLoadBar } from "./statsBreakdownData";
import { monthHasLoadHours } from "./statsBreakdownData";
import type { StatsPageStatus } from "../../hooks/useStatsMonthData";
import "./StatsBreakdowns.css";

interface StatsLoadBreakdownProps {
  status: StatsPageStatus;
  bars: StatsLoadBar[];
}

export default function StatsLoadBreakdown({ status, bars }: StatsLoadBreakdownProps) {
  const hasHours = monthHasLoadHours(bars);
  const maxPercent = bars.reduce((highest, bar) => Math.max(highest, bar.percent), 0);

  return (
    <article className="statsBreakdown">
      <h2 className="statsBreakdown__heading">By Load</h2>
      {status === "loading" ? (
        <p className="statsBreakdown__empty">Loading load hours…</p>
      ) : status === "error" ? (
        <p className="statsBreakdown__empty">Could not load load hours.</p>
      ) : !hasHours ? (
        <p className="statsBreakdown__empty">No load hours to show yet.</p>
      ) : (
        <ul className="statsBreakdown__loadList">
          {bars.map((bar) => {
            const widthPercent = maxPercent > 0 ? (bar.percent / maxPercent) * 100 : 0;
            return (
              <li key={bar.id} className="statsBreakdown__loadRow">
                <span className="statsBreakdown__loadLabel">
                  <span
                    className="statsBreakdown__legendDot"
                    style={{ backgroundColor: bar.barColor }}
                    aria-hidden
                  />
                  <span className="statsBreakdown__loadTitle">
                    {bar.titleRange} {bar.label}
                  </span>
                </span>
                <div className="statsBreakdown__loadTrack">
                  <div
                    className="statsBreakdown__loadFill"
                    style={{ width: `${widthPercent}%`, backgroundColor: bar.barColor }}
                  />
                </div>
                <span className="statsBreakdown__legendHours">{bar.hours.toFixed(1)}h</span>
                <span className="statsBreakdown__legendPercent">{bar.percent}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
