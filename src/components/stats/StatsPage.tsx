import React from "react";
import { HiOutlineCalendarDays, HiOutlineChartBar, HiOutlineChevronDown, HiOutlineClock } from "react-icons/hi2";
import { MdSpeed } from "react-icons/md";
import StatsDailyOverview from "./StatsDailyOverview";
import StatsEnergyLoadChart from "./StatsEnergyLoadChart";
import StatsHoursOverTimeChart from "./StatsHoursOverTimeChart";
import StatsLoadBreakdown from "./StatsLoadBreakdown";
import StatsWorkTypeBreakdown from "./StatsWorkTypeBreakdown";
import { STATS_SUMMARY_CARDS, type StatsSummaryCardId } from "./statsData";
import "./StatsPage.css";

function SummaryIcon({ cardId }: { cardId: StatsSummaryCardId }) {
  if (cardId === "hours") return <HiOutlineCalendarDays aria-hidden />;
  if (cardId === "energy") return <HiOutlineChartBar aria-hidden />;
  if (cardId === "load") return <MdSpeed aria-hidden />;
  return <HiOutlineClock aria-hidden />;
}

/** Static Stats header, summary cards, and placeholder charts. Buttons do nothing yet. */
export default function StatsPage() {
  return (
    <section className="statsPage" aria-label="Stats">
      <header className="statsPage__header">
        <h1 className="statsPage__title">Stats</h1>
        <button type="button" className="statsPage__period" aria-haspopup="listbox">
          This Month
          <HiOutlineChevronDown className="statsPage__periodChevron" aria-hidden />
        </button>
      </header>

      <div className="statsPage__summaryRow">
        {STATS_SUMMARY_CARDS.map((card) => (
          <article key={card.id} className="statsPage__summaryCard">
            <div className="statsPage__summaryTop">
              <span className={`statsPage__summaryIcon statsPage__summaryIcon--${card.id}`}>
                <SummaryIcon cardId={card.id} />
              </span>
              <span className="statsPage__summaryLabel">{card.label}</span>
            </div>
            <p className="statsPage__summaryValue">
              {card.value}
              {card.suffix ? <span className="statsPage__summarySuffix"> {card.suffix}</span> : null}
            </p>
            <p className="statsPage__summaryTrend">↑ {card.trendPercent}% vs last month</p>
          </article>
        ))}
      </div>

      <div className="statsPage__chartsRow">
        <StatsHoursOverTimeChart />
        <StatsEnergyLoadChart />
      </div>

      <StatsDailyOverview />

      <div className="statsPage__chartsRow">
        <StatsWorkTypeBreakdown />
        <StatsLoadBreakdown />
      </div>
    </section>
  );
}
