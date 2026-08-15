import React from "react";
import { HiEllipsisHorizontal, HiOutlineCalendarDays, HiOutlineChartBar } from "react-icons/hi2";
import { energyLevelOption } from "../../constants/energyLevels";
import {
  ENERGY_HISTORY_AVERAGE,
  ENERGY_HISTORY_DAYS_TRACKED,
  ENERGY_HISTORY_ROWS,
  ENERGY_HISTORY_TREND_PERCENT,
} from "./energyHistoryData";
import "./EnergyHistory.css";

export default function EnergyHistory() {
  const isEmpty = ENERGY_HISTORY_ROWS.length === 0;

  return (
    <article className="energyHistory" aria-label="Energy history">
      <header className="energyHistory__header">
        <h2 className="energyHistory__title">Energy History</h2>
        <button type="button" className="energyHistory__viewAll">
          View all
        </button>
      </header>

      <div className="energyHistory__summaryRow">
        <div className="energyHistory__stat">
          <span className="energyHistory__statIcon energyHistory__statIcon--green" aria-hidden>
            <HiOutlineChartBar />
          </span>
          <div>
            <p className="energyHistory__statValue">
              {ENERGY_HISTORY_AVERAGE}
              <span className="energyHistory__statSuffix"> / 5</span>
            </p>
            <p className="energyHistory__statLabel">Average Energy</p>
          </div>
        </div>

        <div className="energyHistory__stat">
          <span className="energyHistory__statIcon energyHistory__statIcon--green" aria-hidden>
            <HiOutlineChartBar />
          </span>
          <div>
            <p className="energyHistory__statValue energyHistory__statValue--up">
              ↑ {ENERGY_HISTORY_TREND_PERCENT}%
            </p>
            <p className="energyHistory__statLabel">vs last 7 days</p>
          </div>
        </div>

        <div className="energyHistory__stat">
          <span className="energyHistory__statIcon energyHistory__statIcon--purple" aria-hidden>
            <HiOutlineCalendarDays />
          </span>
          <div>
            <p className="energyHistory__statValue">{ENERGY_HISTORY_DAYS_TRACKED}</p>
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
                <th scope="col">Energy</th>
                <th scope="col">Note</th>
                <th scope="col">
                  <span className="energyHistory__srOnly">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ENERGY_HISTORY_ROWS.map((row) => {
                const level = energyLevelOption(row.energy);
                const FaceIcon = level.Icon;
                return (
                  <tr key={row.id}>
                    <td className="energyHistory__date">{row.dateLabel}</td>
                    <td>
                      <span className="energyHistory__score" style={{ color: level.color }}>
                        {row.energy}
                        <FaceIcon aria-hidden className="energyHistory__face" />
                      </span>
                    </td>
                    <td className="energyHistory__note">{row.note}</td>
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
    </article>
  );
}
