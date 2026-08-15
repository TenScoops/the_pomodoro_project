import React from "react";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";
import { MdSpeed } from "react-icons/md";
import { useTodayFocusSummary } from "../../hooks/useTodayFocusSummary";
import {
  RECENT_DAY_ROWS,
  RECENT_DAY_SUMMARY_CARDS,
  type LoadScore,
  type RecentDayRow,
  type RecentDaySummaryCard,
  type WorkType,
} from "./recentDaysData";
import "./RecentDays.css";

function SummaryIcon({ cardId }: { cardId: RecentDaySummaryCard["id"] }) {
  if (cardId === "hours") return <HiOutlineClock aria-hidden />;
  if (cardId === "load") return <MdSpeed aria-hidden />;
  return <HiOutlineArrowTrendingUp aria-hidden />;
}

function workTypeDotClass(workType: WorkType): string {
  return workType === "Deep Work"
    ? "recentDays__workDot recentDays__workDot--deep"
    : "recentDays__workDot recentDays__workDot--routine";
}

function loadBadgeClass(load: LoadScore): string {
  return load <= 2 ? "recentDays__load recentDays__load--low" : "recentDays__load recentDays__load--mid";
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
  productivityValue: string
): string {
  if (card.id === "hours") return hoursValue;
  if (card.id === "productivity") return productivityValue;
  return card.value;
}

/** Summary cards use today's session data; the recent-days table is still placeholder. */
export default function RecentDays() {
  const { hoursValue, productivityValue } = useTodayFocusSummary();

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
                {summaryCardValue(card, hoursValue, productivityValue)}
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

        <div className="recentDays__tableWrap">
          <table className="recentDays__table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Work type</th>
                <th scope="col">Load (1-5)</th>
                <th scope="col">Hours</th>
                <th scope="col">Notes</th>
                <th scope="col">
                  <span className="recentDays__srOnly">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {RECENT_DAY_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <DateCell row={row} />
                  </td>
                  <td>
                    <span className="recentDays__workType">
                      <span className={workTypeDotClass(row.workType)} aria-hidden />
                      {row.workType}
                    </span>
                  </td>
                  <td>
                    <span className={loadBadgeClass(row.load)}>{row.load}</span>
                  </td>
                  <td>{row.hours}</td>
                  <td className="recentDays__notes">{row.notes}</td>
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

        <div className="recentDays__footer">
          <span className="recentDays__footerAction">View more</span>
        </div>
      </article>
    </section>
  );
}
