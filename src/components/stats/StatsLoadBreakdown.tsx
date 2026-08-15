import React from "react";
import { STATS_LOAD_BARS } from "./statsBreakdownData";
import "./StatsBreakdowns.css";

export default function StatsLoadBreakdown() {
  const isEmpty = STATS_LOAD_BARS.length === 0;
  const maxPercent = STATS_LOAD_BARS.reduce((highest, bar) => Math.max(highest, bar.percent), 0);

  return (
    <article className="statsBreakdown">
      <h2 className="statsBreakdown__heading">By Load</h2>
      {isEmpty ? (
        <p className="statsBreakdown__empty">No load hours to show yet.</p>
      ) : (
        <ul className="statsBreakdown__loadList">
          {STATS_LOAD_BARS.map((bar) => {
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
