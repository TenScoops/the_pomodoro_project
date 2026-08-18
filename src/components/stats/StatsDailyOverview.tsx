import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";
import { formatWorkTypeWithHours } from "../focus/recentDaysData";
import type { StatsPageStatus } from "../../hooks/useStatsMonthData";
import type { EnergyLevelScore } from "../../types/pomoprogress";
import {
  STATS_DAILY_OVERVIEW_PREVIEW_ROWS,
  type StatsDailyOverviewRow,
} from "./statsDailyOverviewData";
import "./StatsDailyOverview.css";

interface StatsDailyOverviewProps {
  status: StatsPageStatus;
  rows: StatsDailyOverviewRow[];
}

function loadBadgeValue(load: number): number {
  const rounded = Math.round(load);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded;
}

/** High load is orange; low load is green. */
function loadBadgeClass(load: number): string {
  const rounded = loadBadgeValue(load);
  if (rounded <= 2) return "statsDailyOverview__badge statsDailyOverview__badge--green";
  if (rounded === 3) return "statsDailyOverview__badge statsDailyOverview__badge--yellow";
  return "statsDailyOverview__badge statsDailyOverview__badge--orange";
}

/** High energy is green; low energy is orange. */
function energyBadgeClass(energy: EnergyLevelScore): string {
  if (energy >= 4.5) return "statsDailyOverview__badge statsDailyOverview__badge--energyHigh";
  if (energy >= 3.5) return "statsDailyOverview__badge statsDailyOverview__badge--green";
  if (energy >= 2.5) return "statsDailyOverview__badge statsDailyOverview__badge--yellow";
  return "statsDailyOverview__badge statsDailyOverview__badge--orange";
}

function WorkTypeCell({ row }: { row: StatsDailyOverviewRow }) {
  const label = formatWorkTypeWithHours(row.workType, row.deepWorkSeconds, row.routineSeconds);
  if (!row.workType || !label) {
    return <span className="statsDailyOverview__muted">—</span>;
  }

  const showDeep = row.workType === "Deep Work" || row.workType === "Deep Work/Routine";
  const showRoutine = row.workType === "Routine" || row.workType === "Deep Work/Routine";

  return (
    <span className="statsDailyOverview__workType">
      <span className="statsDailyOverview__workDots" aria-hidden>
        {showDeep ? <span className="statsDailyOverview__workDot statsDailyOverview__workDot--deep" /> : null}
        {showRoutine ? (
          <span className="statsDailyOverview__workDot statsDailyOverview__workDot--routine" />
        ) : null}
      </span>
      {label}
    </span>
  );
}

function OverviewTable({ rows }: { rows: StatsDailyOverviewRow[] }) {
  return (
    <div className="statsDailyOverview__tableWrap">
      <table className="statsDailyOverview__table">
        <thead>
          <tr>
            <th scope="col" className="statsDailyOverview__colFit">
              Date
            </th>
            <th scope="col" className="statsDailyOverview__colFit">
              Work type
            </th>
            <th scope="col" className="statsDailyOverview__colFit statsDailyOverview__colCenter">
              Load (1-5)
            </th>
            <th scope="col" className="statsDailyOverview__colFit statsDailyOverview__colCenter">
              Hours
            </th>
            <th scope="col" className="statsDailyOverview__colFit statsDailyOverview__colCenter">
              Energy (1-5)
            </th>
            <th scope="col" className="statsDailyOverview__notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="statsDailyOverview__date statsDailyOverview__colFit">{row.dateLabel}</td>
              <td className="statsDailyOverview__colFit">
                <WorkTypeCell row={row} />
              </td>
              <td className="statsDailyOverview__colFit statsDailyOverview__colCenter">
                {row.load != null ? (
                  <span className={loadBadgeClass(row.load)}>{loadBadgeValue(row.load)}</span>
                ) : (
                  <span className="statsDailyOverview__muted">—</span>
                )}
              </td>
              <td className="statsDailyOverview__colFit statsDailyOverview__colCenter">{row.hours}</td>
              <td className="statsDailyOverview__colFit statsDailyOverview__colCenter">
                {row.energy != null ? (
                  <span className={energyBadgeClass(row.energy)}>{row.energy}</span>
                ) : (
                  <span className="statsDailyOverview__muted">—</span>
                )}
              </td>
              <td className="statsDailyOverview__notes" title={row.notes ?? undefined}>
                {row.notes ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** This month’s work days: weighted load, energy score, and Focus notes. */
export default function StatsDailyOverview({ status, rows }: StatsDailyOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = rows.length > STATS_DAILY_OVERVIEW_PREVIEW_ROWS;
  const visibleRows = expanded ? rows : rows.slice(0, STATS_DAILY_OVERVIEW_PREVIEW_ROWS);

  let body: React.ReactNode;
  if (status === "loading") {
    body = <p className="statsDailyOverview__empty">Loading daily overview…</p>;
  } else if (status === "error") {
    body = <p className="statsDailyOverview__empty">Could not load daily overview.</p>;
  } else if (rows.length === 0) {
    body = <p className="statsDailyOverview__empty">No days to show yet.</p>;
  } else {
    body = <OverviewTable rows={visibleRows} />;
  }

  return (
    <article className="statsDailyOverview" aria-label="Daily overview">
      <h2 className="statsDailyOverview__heading">Daily Overview</h2>
      {body}
      {status === "ready" && hasMore ? (
        <div className="statsDailyOverview__footer">
          <button
            type="button"
            className="statsDailyOverview__viewMore"
            onClick={() => setExpanded((currentlyExpanded) => !currentlyExpanded)}
          >
            {expanded ? "View less" : "View more"}
            {expanded ? <HiOutlineChevronUp aria-hidden /> : <HiOutlineChevronDown aria-hidden />}
          </button>
        </div>
      ) : (
        <div className="statsDailyOverview__footer">
          <span className="statsDailyOverview__viewMore">
            View more
            <HiOutlineChevronDown aria-hidden />
          </span>
        </div>
      )}
    </article>
  );
}
