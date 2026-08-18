import { loadBandLevel, STATS_LOAD_BANDS } from "../components/stats/statsBreakdownData";
import { hoursFromSeconds, type AnalysisEnergyLog, type AnalysisFocusNote } from "./aiAnalysisDaySummary";
import type { DateRange } from "./aiAnalysisRanges";
import type {
  CompactLoadBand,
  MetricDeltas,
  ProductivityTrend,
} from "../types/aiMetrics";
import type { SessionWithRatings } from "../types/pomoprogress";

const TREND_FLAT_THRESHOLD = 0.25;

export function sessionsInRange(sessions: SessionWithRatings[], range: DateRange): SessionWithRatings[] {
  return sessions.filter((session) => session.date >= range.startDate && session.date <= range.endDate);
}

export function energyLogsInRange(logs: AnalysisEnergyLog[], range: DateRange): AnalysisEnergyLog[] {
  return logs.filter((log) => log.date >= range.startDate && log.date <= range.endDate);
}

export function focusNotesInRange(notes: AnalysisFocusNote[], range: DateRange): AnalysisFocusNote[] {
  return notes.filter((row) => row.date >= range.startDate && row.date <= range.endDate);
}

export function compactLoadBands(sessions: SessionWithRatings[]): CompactLoadBand[] {
  const secondsByLevel: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const session of sessions) {
    for (const rating of session.block_ratings ?? []) {
      if (rating.load == null || (rating.duration_seconds ?? 0) <= 0) {
        continue;
      }
      const band = loadBandLevel(rating.load);
      if (band == null) {
        continue;
      }
      secondsByLevel[band] += rating.duration_seconds ?? 0;
    }
  }

  const bands: CompactLoadBand[] = [];
  for (const band of STATS_LOAD_BANDS) {
    const hours = hoursFromSeconds(secondsByLevel[band.level]);
    if (hours > 0) {
      bands.push({ label: band.label, level: band.level, hours });
    }
  }
  return bands;
}

function roundedDelta(current: number, previous: number): number {
  return Number((current - previous).toFixed(2));
}

export function metricDeltas(input: {
  currentHours: number;
  previousHours: number;
  currentProductivity: number | null;
  previousProductivity: number | null;
  currentLoad: number | null;
  previousLoad: number | null;
  currentEnergy: number | null;
  previousEnergy: number | null;
}): MetricDeltas {
  return {
    hoursWorked: roundedDelta(input.currentHours, input.previousHours),
    productivityAvg:
      input.currentProductivity == null || input.previousProductivity == null
        ? null
        : roundedDelta(input.currentProductivity, input.previousProductivity),
    loadAvg:
      input.currentLoad == null || input.previousLoad == null
        ? null
        : roundedDelta(input.currentLoad, input.previousLoad),
    energy:
      input.currentEnergy == null || input.previousEnergy == null
        ? null
        : roundedDelta(input.currentEnergy, input.previousEnergy),
  };
}

export function productivityTrendFromAverages(
  current: number | null,
  previous: number | null
): ProductivityTrend | null {
  if (current == null || previous == null) {
    return null;
  }
  const delta = current - previous;
  if (Math.abs(delta) < TREND_FLAT_THRESHOLD) {
    return "flat";
  }
  return delta > 0 ? "up" : "down";
}

export function comparisonHasData(input: {
  hoursWorked: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
  noteCount: number;
}): boolean {
  return (
    input.hoursWorked > 0 ||
    input.productivityAvg != null ||
    input.loadAvg != null ||
    input.energy != null ||
    input.noteCount > 0
  );
}

const BLOCK_QUESTION = /\btoday\b|\bblock|\bsession/i;

export function shouldIncludeBlocks(mode: "today" | "week" | "trends" | "ask", question?: string): boolean {
  if (mode === "today") {
    return true;
  }
  if (mode !== "ask" || !question) {
    return false;
  }
  return BLOCK_QUESTION.test(question);
}

export function comparisonLabel(mode: "today" | "week" | "trends" | "ask"): string {
  if (mode === "today") {
    return "yesterday";
  }
  if (mode === "week") {
    return "previous week";
  }
  if (mode === "trends") {
    return "previous 12 weeks";
  }
  return "previous 30 days";
}
