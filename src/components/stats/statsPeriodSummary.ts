import { weightedDailyLoad, type LoadBlockInput } from "../../lib/effectiveLoad";
import type { SessionWithRatings } from "../../types/pomoprogress";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import { formatFocusLoadNumber } from "../focus/recentDaysData";
import type { StatsSummaryCard } from "./statsData";

export function periodWorkSecondsFromSessions(sessions: SessionWithRatings[]): number {
  return sessions.reduce((total, session) => total + session.total_time_worked, 0);
}

/** Range-level load from every rated block this period (Routine still half-weighted). */
export function periodLoadAvgFromSessions(sessions: SessionWithRatings[]): {
  loadAvg: number;
  loadCount: number;
} {
  const blocks: LoadBlockInput[] = [];
  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      blocks.push({
        load: rating.load,
        workType: rating.work_type,
        durationSeconds: rating.duration_seconds,
      });
    }
  }
  const summary = weightedDailyLoad(blocks);
  return { loadAvg: summary.loadAvg, loadCount: summary.loadCount };
}

export function periodProductivityAvgFromSessions(sessions: SessionWithRatings[]): {
  productivityAvg: number;
  ratingCount: number;
} {
  let ratingSum = 0;
  let ratingCount = 0;
  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      ratingSum += rating.rating;
      ratingCount += 1;
    }
  }
  if (ratingCount === 0) {
    return { productivityAvg: 0, ratingCount: 0 };
  }
  return {
    productivityAvg: Number((ratingSum / ratingCount).toFixed(1)),
    ratingCount,
  };
}

export function periodEnergyAvgFromLogs(
  logs: EnergyLogRecord[],
  startDate: string,
  endDate: string
): { energyAvg: number; logCount: number } {
  const inRange = logs.filter((log) => log.date >= startDate && log.date <= endDate);
  if (inRange.length === 0) {
    return { energyAvg: 0, logCount: 0 };
  }
  let energySum = 0;
  for (const log of inRange) {
    energySum += log.energy;
  }
  return {
    energyAvg: Number((energySum / inRange.length).toFixed(1)),
    logCount: inRange.length,
  };
}

export function buildStatsSummaryCards(input: {
  workSeconds: number;
  energyAvg: number;
  energyCount: number;
  loadAvg: number;
  loadCount: number;
  productivityAvg: number;
  ratingCount: number;
}): StatsSummaryCard[] {
  const hoursValue =
    input.workSeconds <= 0 ? "0" : Number((input.workSeconds / 3600).toFixed(1)).toString();
  const energyValue = input.energyCount === 0 || input.energyAvg === 0 ? "0" : input.energyAvg.toFixed(1);
  const loadValue =
    input.loadCount === 0 || input.loadAvg === 0 ? "0" : formatFocusLoadNumber(input.loadAvg);
  const productivityValue =
    input.ratingCount === 0 || input.productivityAvg === 0 ? "0" : input.productivityAvg.toFixed(1);

  return [
    { id: "hours", label: "Total Work Hours", value: hoursValue, suffix: null, trendPercent: null },
    {
      id: "energy",
      label: "Average Energy",
      value: energyValue,
      suffix: energyValue === "0" ? null : "/ 5",
      trendPercent: null,
    },
    {
      id: "load",
      label: "Average Load",
      value: loadValue,
      suffix: loadValue === "0" ? null : "/ 5",
      trendPercent: null,
    },
    {
      id: "productivity",
      label: "Productivity Avg.",
      value: productivityValue,
      suffix: productivityValue === "0" ? null : "/ 10",
      trendPercent: null,
    },
  ];
}
