import React from "react";
import { HiOutlineCalendarDays, HiOutlineChevronDown } from "react-icons/hi2";
import { getAppNow } from "../../lib/calendarDates";
import { useEnergyLogs } from "../../hooks/useEnergyLogs";
import EnergyHistory from "./EnergyHistory";
import EnergyLogCard from "./EnergyLogCard";
import "./EnergyPage.css";

function formatEnergyPageDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function EnergyPage() {
  const todayLabel = formatEnergyPageDate(getAppNow());
  const { status, saveStatus, logs, todayLog, saveToday, reload } = useEnergyLogs();

  return (
    <section className="energyPage" aria-label="Energy">
      <header className="energyPage__header">
        <div className="energyPage__heading">
          <h1 className="energyPage__title">Energy</h1>
          <p className="energyPage__lede">
            Track your energy to understand your patterns and improve your performance.
          </p>
        </div>
        <button type="button" className="energyPage__date" aria-label={`Selected date ${todayLabel}`}>
          <HiOutlineCalendarDays className="energyPage__dateIcon" aria-hidden />
          {todayLabel}
          <HiOutlineChevronDown className="energyPage__dateIcon" aria-hidden />
        </button>
      </header>

      <EnergyLogCard
        status={status}
        saveStatus={saveStatus}
        todayLog={todayLog}
        onSave={saveToday}
        onRetry={reload}
      />
      <EnergyHistory status={status} logs={logs} onRetry={reload} />
    </section>
  );
}
