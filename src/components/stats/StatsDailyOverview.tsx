import React from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import {
  STATS_DAILY_OVERVIEW_ROWS,
  type StatsScore1to5,
  type StatsWorkType,
} from "./statsData";
import "./StatsDailyOverview.css";

function workTypeDotClass(workType: StatsWorkType): string {
  return workType === "Deep Work"
    ? "statsDailyOverview__workDot statsDailyOverview__workDot--deep"
    : "statsDailyOverview__workDot statsDailyOverview__workDot--routine";
}

/** High load is orange; low load is green. */
function loadBadgeClass(load: StatsScore1to5): string {
  if (load <= 2) return "statsDailyOverview__badge statsDailyOverview__badge--green";
  if (load === 3) return "statsDailyOverview__badge statsDailyOverview__badge--yellow";
  return "statsDailyOverview__badge statsDailyOverview__badge--orange";
}

/** High energy is green; low energy is orange. */
function energyBadgeClass(energy: StatsScore1to5): string {
  if (energy >= 4) return "statsDailyOverview__badge statsDailyOverview__badge--green";
  if (energy === 3) return "statsDailyOverview__badge statsDailyOverview__badge--yellow";
  return "statsDailyOverview__badge statsDailyOverview__badge--orange";
}

/** Static Daily Overview table. View more does nothing yet. */
export default function StatsDailyOverview() {
  const isEmpty = STATS_DAILY_OVERVIEW_ROWS.length === 0;

  return (
    <article className="statsDailyOverview" aria-label="Daily overview">
      <h2 className="statsDailyOverview__heading">Daily Overview</h2>

      {isEmpty ? (
        <p className="statsDailyOverview__empty">No days to show yet.</p>
      ) : (
        <div className="statsDailyOverview__tableWrap">
          <table className="statsDailyOverview__table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Work type</th>
                <th scope="col" className="statsDailyOverview__colCenter">
                  Load (1-5)
                </th>
                <th scope="col" className="statsDailyOverview__colCenter">
                  Hours
                </th>
                <th scope="col" className="statsDailyOverview__colCenter">
                  Energy (1-5)
                </th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {STATS_DAILY_OVERVIEW_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="statsDailyOverview__date">{row.dateLabel}</td>
                  <td>
                    <span className="statsDailyOverview__workType">
                      <span className={workTypeDotClass(row.workType)} aria-hidden />
                      {row.workType}
                    </span>
                  </td>
                  <td className="statsDailyOverview__colCenter">
                    <span className={loadBadgeClass(row.load)}>{row.load}</span>
                  </td>
                  <td className="statsDailyOverview__colCenter">{row.hours}</td>
                  <td className="statsDailyOverview__colCenter">
                    <span className={energyBadgeClass(row.energy)}>{row.energy}</span>
                  </td>
                  <td className="statsDailyOverview__notes">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="statsDailyOverview__footer">
        <span className="statsDailyOverview__viewMore">
          View more
          <HiOutlineChevronDown aria-hidden />
        </span>
      </div>
    </article>
  );
}
