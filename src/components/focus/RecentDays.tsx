import React from "react";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";
import { MdSpeed } from "react-icons/md";
import { useTodayFocusSummary } from "../../hooks/useTodayFocusSummary";
import {
  RECENT_DAY_SUMMARY_CARDS,
  formatWorkTypeWithHours,
  type LoadScore,
  type RecentDayRow,
  type RecentDaySummaryCard,
} from "./recentDaysData";
import "./RecentDays.css";

function SummaryIcon({ cardId }: { cardId: RecentDaySummaryCard["id"] }) {
  if (cardId === "hours") return <HiOutlineClock aria-hidden />;
  if (cardId === "load") return <MdSpeed aria-hidden />;
  return <HiOutlineArrowTrendingUp aria-hidden />;
}

function WorkTypeCell({ row }: { row: RecentDayRow }) {
  const label = formatWorkTypeWithHours(row.workType, row.deepWorkSeconds, row.routineSeconds);
  if (!row.workType || !label) {
    return <span className="recentDays__muted">—</span>;
  }

  const showDeep = row.workType === "Deep Work" || row.workType === "Deep Work/Routine";
  const showRoutine = row.workType === "Routine" || row.workType === "Deep Work/Routine";

  return (
    <span className="recentDays__workType">
      <span className="recentDays__workDots" aria-hidden>
        {showDeep ? <span className="recentDays__workDot recentDays__workDot--deep" /> : null}
        {showRoutine ? <span className="recentDays__workDot recentDays__workDot--routine" /> : null}
      </span>
      {label}
    </span>
  );
}

function loadBadgeClass(load: LoadScore): string {
  return load <= 2 ? "recentDays__load recentDays__load--low" : "recentDays__load recentDays__load--mid";
}

function productivityBadgeClass(productivity: number): string {
  if (productivity >= 7) return "recentDays__productivity recentDays__productivity--high";
  if (productivity >= 4) return "recentDays__productivity recentDays__productivity--mid";
  return "recentDays__productivity recentDays__productivity--low";
}

function DateCell({ row }: { row: RecentDayRow }) {
  if (!row.dateDetail) {
    return <span className="recentDays__datePrimary">{row.dateLabel}</span>;
  }

  return (
    <span className="recentDays__dateStack">
      <span className="recentDays__datePrimary">{row.dateLabel}</span>
      <span className="recentDays__dateDetail">{row.dateDetail}</span>
    </span>
  );
}

function summaryCardValue(
  card: RecentDaySummaryCard,
  hoursValue: string,
  loadValue: string,
  productivityValue: string
): string {
  if (card.id === "hours") return hoursValue;
  if (card.id === "load") return loadValue;
  return productivityValue;
}

/** Today's summary cards and up to four recent days from logged sessions. */
export default function RecentDays() {
  const { hoursValue, loadValue, productivityValue, recentRows } = useTodayFocusSummary();

  return (
    <section className="recentDays" aria-label="Recent days">
      <div className="recentDays__summaryRow">
        {RECENT_DAY_SUMMARY_CARDS.map((card) => (
          <article key={card.id} className="recentDays__summaryCard">
            <span className={`recentDays__summaryIcon recentDays__summaryIcon--${card.id}`}>
              <SummaryIcon cardId={card.id} />
            </span>
            <div className="recentDays__summaryCopy">
              <span className="recentDays__summaryLabel">{card.label}</span>
              <span className="recentDays__summaryValue">
                {summaryCardValue(card, hoursValue, loadValue, productivityValue)}
              </span>
            </div>
          </article>
        ))}
      </div>

      <article className="recentDays__tableCard">
        <div className="recentDays__tableHeader">
          <h2 className="recentDays__heading">Recent days</h2>
          <span className="recentDays__headerAction">View all</span>
        </div>

        {recentRows.length === 0 ? (
          <p className="recentDays__empty">No recent days to show yet.</p>
        ) : (
          <div className="recentDays__tableWrap">
            <table className="recentDays__table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Work type</th>
                  <th scope="col">Load (1-5)</th>
                  <th scope="col">Prod. (1-10)</th>
                  <th scope="col">Hours</th>
                  <th scope="col">Notes</th>
                  <th scope="col">
                    <span className="recentDays__srOnly">Row actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <DateCell row={row} />
                    </td>
                    <td>
                      {row.workType ? (
                        <WorkTypeCell row={row} />
                      ) : (
                        <span className="recentDays__muted">—</span>
                      )}
                    </td>
                    <td>
                      {row.load != null ? (
                        <span className={loadBadgeClass(row.load)}>{row.load}</span>
                      ) : (
                        <span className="recentDays__muted">—</span>
                      )}
                    </td>
                    <td>
                      {row.productivity != null ? (
                        <span className={productivityBadgeClass(row.productivity)}>
                          {row.productivity.toFixed(1)}
                        </span>
                      ) : (
                        <span className="recentDays__muted">—</span>
                      )}
                    </td>
                    <td>{row.hours}</td>
                    <td className="recentDays__notes">{row.notes ?? "—"}</td>
                    <td>
                      <span className="recentDays__rowMenu" aria-hidden>
                        <HiOutlineEllipsisHorizontal />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="recentDays__footer">
          <span className="recentDays__footerAction">View more</span>
        </div>
      </article>
    </section>
  );
}
