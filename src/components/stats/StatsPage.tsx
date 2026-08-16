import React, { useMemo } from "react";
import { HiOutlineCalendarDays, HiOutlineChartBar, HiOutlineChevronDown, HiOutlineClock } from "react-icons/hi2";
import { MdSpeed } from "react-icons/md";
import { useStatsMonthData } from "../../hooks/useStatsMonthData";
import StatsDailyOverview from "./StatsDailyOverview";
import StatsEnergyLoadChart from "./StatsEnergyLoadChart";
import StatsHoursOverTimeChart from "./StatsHoursOverTimeChart";
import StatsLoadBreakdown from "./StatsLoadBreakdown";
import StatsWorkTypeBreakdown from "./StatsWorkTypeBreakdown";
import {
  buildLoadBarsFromSessions,
  buildWorkTypeSlicesFromSessions,
} from "./statsBreakdownData";
import { type StatsSummaryCardId } from "./statsData";
import {
  buildStatsSummaryCards,
  periodEnergyAvgFromLogs,
  periodLoadAvgFromSessions,
  periodProductivityAvgFromSessions,
  periodWorkSecondsFromSessions,
} from "./statsPeriodSummary";
import { buildEnergyLoadSeries } from "./statsEnergyLoadSeries";
import "./StatsPage.css";

function SummaryIcon({ cardId }: { cardId: StatsSummaryCardId }) {
  if (cardId === "hours") return <HiOutlineCalendarDays aria-hidden />;
  if (cardId === "energy") return <HiOutlineChartBar aria-hidden />;
  if (cardId === "load") return <MdSpeed aria-hidden />;
  return <HiOutlineClock aria-hidden />;
}

/** Live month totals for summary cards, work-type donut, and By Load bars. */
export default function StatsPage() {
  const { status, sessions, energyLogs, rangeStart, rangeEnd } = useStatsMonthData();

  const loadBars = useMemo(() => buildLoadBarsFromSessions(sessions), [sessions]);
  const workType = useMemo(() => buildWorkTypeSlicesFromSessions(sessions), [sessions]);
  const energyLoadPoints = useMemo(
    () =>
      buildEnergyLoadSeries({
        sessions,
        energyLogs,
        rangeStart,
        rangeEnd,
      }),
    [sessions, energyLogs, rangeStart, rangeEnd]
  );
  const summaryCards = useMemo(() => {
    const load = periodLoadAvgFromSessions(sessions);
    const productivity = periodProductivityAvgFromSessions(sessions);
    const energy = periodEnergyAvgFromLogs(energyLogs, rangeStart, rangeEnd);
    return buildStatsSummaryCards({
      workSeconds: periodWorkSecondsFromSessions(sessions),
      energyAvg: energy.energyAvg,
      energyCount: energy.logCount,
      loadAvg: load.loadAvg,
      loadCount: load.loadCount,
      productivityAvg: productivity.productivityAvg,
      ratingCount: productivity.ratingCount,
    });
  }, [sessions, energyLogs, rangeStart, rangeEnd]);

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
        {summaryCards.map((card) => (
          <article key={card.id} className="statsPage__summaryCard">
            <div className="statsPage__summaryTop">
              <span className={`statsPage__summaryIcon statsPage__summaryIcon--${card.id}`}>
                <SummaryIcon cardId={card.id} />
              </span>
              <span className="statsPage__summaryLabel">{card.label}</span>
            </div>
            <p className="statsPage__summaryValue">
              {status === "loading" ? "…" : card.value}
              {status === "ready" && card.suffix ? (
                <span className="statsPage__summarySuffix"> {card.suffix}</span>
              ) : null}
            </p>
            <p className="statsPage__summaryTrend">
              {card.trendPercent == null
                ? "waiting for more info"
                : `↑ ${card.trendPercent}% vs last month`}
            </p>
          </article>
        ))}
      </div>

      <div className="statsPage__chartsRow">
        <StatsHoursOverTimeChart />
        <StatsEnergyLoadChart status={status} points={energyLoadPoints} />
      </div>

      <StatsDailyOverview />

      <div className="statsPage__chartsRow">
        <StatsWorkTypeBreakdown status={status} slices={workType.slices} totalHours={workType.totalHours} />
        <StatsLoadBreakdown status={status} bars={loadBars} />
      </div>
    </section>
  );
}
