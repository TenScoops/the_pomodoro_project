import React from "react";
import { HiEllipsisHorizontal, HiOutlineCalendarDays, HiOutlineChartBar } from "react-icons/hi2";
import { energyLevelOption } from "../../constants/energyLevels";
import type { EnergyLogsStatus } from "../../hooks/useEnergyLogs";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import { todayLocalISODate } from "../../lib/calendarDates";
import { summarizeEnergyLogs, toHistoryRows } from "./energyHistoryData";
import "./EnergyHistory.css";

interface EnergyHistoryProps {
  status: EnergyLogsStatus;
  logs: EnergyLogRecord[];
  onRetry: () => void;
}

export default function EnergyHistory({ status, logs, onRetry }: EnergyHistoryProps) {
  const todayIso = todayLocalISODate();
  const summary = summarizeEnergyLogs(logs, todayIso);
  const rows = toHistoryRows(logs, todayIso);
  const isEmpty = rows.length === 0;
  const trendUp = summary.trendPercent !== null && summary.trendPercent >= 0;

  return (
    <article className="energyHistory" aria-label="Energy history">
      <header className="energyHistory__header">
        <h2 className="energyHistory__title">Energy History</h2>
        <button type="button" className="energyHistory__viewAll">
          View all
        </button>
      </header>

      {status === "loading" ? (
        <div className="energyHistory__skeleton" aria-busy="true">
          <div className="energyHistory__skeletonBar" />
          <div className="energyHistory__skeletonBar energyHistory__skeletonBar--tall" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="energyHistory__error" role="alert">
          <p>Could not load energy history.</p>
          <button type="button" className="energyHistory__retry" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="energyHistory__summaryRow">
            <div className="energyHistory__stat">
              <span className="energyHistory__statIcon energyHistory__statIcon--green" aria-hidden>
                <HiOutlineChartBar />
              </span>
              <div>
                <p className="energyHistory__statValue">
                  {summary.averageLabel}
                  {summary.averageLabel !== "—" ? <span className="energyHistory__statSuffix"> / 5</span> : null}
                </p>
                <p className="energyHistory__statLabel">Average Energy</p>
              </div>
            </div>

            <div className="energyHistory__stat">
              <span className="energyHistory__statIcon energyHistory__statIcon--green" aria-hidden>
                <HiOutlineChartBar />
              </span>
              <div>
                <p
                  className={`energyHistory__statValue${
                    summary.trendPercent === null ? "" : trendUp ? " energyHistory__statValue--up" : " energyHistory__statValue--down"
                  }`}
                >
                  {summary.trendPercent === null ? "—" : `${trendUp ? "↑" : "↓"} ${Math.abs(summary.trendPercent)}%`}
                </p>
                <p className="energyHistory__statLabel">vs last 7 days</p>
              </div>
            </div>

            <div className="energyHistory__stat">
              <span className="energyHistory__statIcon energyHistory__statIcon--purple" aria-hidden>
                <HiOutlineCalendarDays />
              </span>
              <div>
                <p className="energyHistory__statValue">{summary.daysTracked}</p>
                <p className="energyHistory__statLabel">Days Tracked</p>
              </div>
            </div>
          </div>

          {isEmpty ? (
            <p className="energyHistory__empty">No energy logs to show yet.</p>
          ) : (
            <div className="energyHistory__tableWrap">
              <table className="energyHistory__table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col" className="energyHistory__energyCol">Energy</th>
                    <th scope="col">Note</th>
                    <th scope="col">
                      <span className="energyHistory__srOnly">Row actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const level = energyLevelOption(row.energy);
                    const FaceIcon = level.Icon;
                    return (
                      <tr key={row.id}>
                        <td className="energyHistory__date">{row.dateLabel}</td>
                        <td className="energyHistory__energyCol">
                          <span className="energyHistory__score" style={{ color: level.color }}>
                            {row.energy}
                            <FaceIcon aria-hidden className="energyHistory__face" />
                          </span>
                        </td>
                        <td className="energyHistory__note">{row.note || "—"}</td>
                        <td className="energyHistory__menuCell">
                          <button type="button" className="energyHistory__menu" aria-label={`More for ${row.dateLabel}`}>
                            <HiEllipsisHorizontal aria-hidden />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </article>
  );
}
