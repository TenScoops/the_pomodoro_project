import type { EnergyLevel } from "../../constants/energyLevels";
import { parseLocalISODate, shiftLocalISODate } from "../../lib/calendarDates";
import type { EnergyLogRecord } from "../../services/pomoprogressService";

export interface EnergyHistoryRow {
  id: string;
  date: string;
  dateLabel: string;
  energy: EnergyLevel;
  note: string;
}

export interface EnergyHistorySummary {
  averageLabel: string;
  trendPercent: number | null;
  daysTracked: number;
}

export const ENERGY_HISTORY_PREVIEW_LIMIT = 7;

export function formatEnergyLogDateLabel(isoDate: string, todayIso: string): string {
  const parsed = parseLocalISODate(isoDate);
  const monthDay = parsed
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(parsed)
    : isoDate;
  const withYear = parsed
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(parsed)
    : isoDate;

  if (isoDate === todayIso) {
    return `Today, ${monthDay}`;
  }
  if (isoDate === shiftLocalISODate(todayIso, -1)) {
    return `Yesterday, ${monthDay}`;
  }
  return withYear;
}

function averageEnergy(logs: EnergyLogRecord[]): number | null {
  if (logs.length === 0) {
    return null;
  }
  const total = logs.reduce((sum, log) => sum + log.energy, 0);
  return total / logs.length;
}

function logsInRange(logs: EnergyLogRecord[], startIso: string, endIso: string): EnergyLogRecord[] {
  return logs.filter((log) => log.date >= startIso && log.date <= endIso);
}

export function summarizeEnergyLogs(logs: EnergyLogRecord[], todayIso: string): EnergyHistorySummary {
  const overall = averageEnergy(logs);
  const lastSeven = logsInRange(logs, shiftLocalISODate(todayIso, -6), todayIso);
  const previousSeven = logsInRange(logs, shiftLocalISODate(todayIso, -13), shiftLocalISODate(todayIso, -7));
  const recentAverage = averageEnergy(lastSeven);
  const previousAverage = averageEnergy(previousSeven);

  let trendPercent: number | null = null;
  if (recentAverage !== null && previousAverage !== null && previousAverage > 0) {
    trendPercent = Math.round(((recentAverage - previousAverage) / previousAverage) * 100);
  }

  return {
    averageLabel: overall === null ? "—" : overall.toFixed(1),
    trendPercent,
    daysTracked: logs.length,
  };
}

export function toHistoryRows(logs: EnergyLogRecord[], todayIso: string): EnergyHistoryRow[] {
  return logs.slice(0, ENERGY_HISTORY_PREVIEW_LIMIT).map((log) => ({
    id: log.id,
    date: log.date,
    dateLabel: formatEnergyLogDateLabel(log.date, todayIso),
    energy: log.energy,
    note: log.note,
  }));
}
