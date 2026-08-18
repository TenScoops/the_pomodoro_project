import {
  averageEnergy,
  buildDaySummaries,
  bundleHasData,
  collectTodayBlocks,
  summarizeSessionSet,
  type AnalysisEnergyLog,
  type AnalysisFocusNote,
} from "./aiAnalysisDaySummary";
import {
  comparisonHasData,
  comparisonLabel,
  compactLoadBands,
  energyLogsInRange,
  focusNotesInRange,
  metricDeltas,
  productivityTrendFromAverages,
  sessionsInRange,
  shouldIncludeBlocks,
} from "./aiAnalysisInsights";
import { mondayOfWeek, type DateRange } from "./aiAnalysisRanges";
import { shiftLocalISODate } from "./calendarDates";
import type { AnalysisMode } from "../types/aiAnalysis";
import type {
  CompactDayMetrics,
  CompactPeriodMetrics,
  CompactWeekMetrics,
  PeriodComparison,
} from "../types/aiMetrics";
import type { SessionWithRatings } from "../types/pomoprogress";

export interface ProductivityDataInput {
  mode: AnalysisMode;
  localDate: string;
  currentRange: DateRange;
  previousRange: DateRange;
  question?: string;
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  focusNotes: AnalysisFocusNote[];
}

function collectNotes(
  focusNotes: AnalysisFocusNote[],
  energyLogs: AnalysisEnergyLog[],
  includeDates: boolean
): string[] {
  const notes: string[] = [];
  for (const row of focusNotes) {
    const text = row.note.trim();
    if (text) {
      notes.push(includeDates ? `${row.date}: ${text}` : text);
    }
  }
  for (const log of energyLogs) {
    const text = log.note.trim();
    if (text) {
      notes.push(includeDates ? `${log.date}: ${text}` : text);
    }
  }
  return notes;
}

function compactDays(input: {
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  focusNotes: AnalysisFocusNote[];
}): CompactDayMetrics[] {
  return buildDaySummaries(input).map((day) => ({
    date: day.date,
    hoursWorked: day.hours,
    deepWorkHours: day.deepWorkHours,
    routineHours: day.routineHours,
    productivityAvg: day.productivityAvg,
    loadAvg: day.loadAvg,
    energy: day.energy,
  }));
}

function weeklyAggregates(input: {
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  range: DateRange;
}): CompactWeekMetrics[] {
  const weeks: CompactWeekMetrics[] = [];
  let weekStart = mondayOfWeek(input.range.startDate);
  while (weekStart <= input.range.endDate) {
    const weekEndCandidate = shiftLocalISODate(weekStart, 6);
    const weekEnd = weekEndCandidate < input.range.endDate ? weekEndCandidate : input.range.endDate;
    const weekRange = { startDate: weekStart, endDate: weekEnd };
    const weekSessions = sessionsInRange(input.sessions, weekRange);
    const weekEnergy = energyLogsInRange(input.energyLogs, weekRange);
    const summary = summarizeSessionSet(weekSessions);
    if (summary.hours > 0 || weekEnergy.length > 0) {
      weeks.push({
        weekStart,
        weekEnd,
        hoursWorked: summary.hours,
        deepWorkHours: summary.deepWorkHours,
        routineHours: summary.routineHours,
        productivityAvg: summary.productivityAvg,
        loadAvg: summary.loadAvg,
        energy: averageEnergy(weekEnergy),
      });
    }
    weekStart = shiftLocalISODate(weekStart, 7);
  }
  return weeks;
}

function buildComparison(
  mode: AnalysisMode,
  current: {
    hoursWorked: number;
    productivityAvg: number | null;
    loadAvg: number | null;
    energy: number | null;
  },
  previous: {
    hoursWorked: number;
    productivityAvg: number | null;
    loadAvg: number | null;
    energy: number | null;
    noteCount: number;
  }
): PeriodComparison | null {
  if (!comparisonHasData(previous)) {
    return null;
  }
  return {
    label: comparisonLabel(mode),
    hoursWorked: previous.hoursWorked,
    productivityAvg: previous.productivityAvg,
    loadAvg: previous.loadAvg,
    energy: previous.energy,
    deltas: metricDeltas({
      currentHours: current.hoursWorked,
      previousHours: previous.hoursWorked,
      currentProductivity: current.productivityAvg,
      previousProductivity: previous.productivityAvg,
      currentLoad: current.loadAvg,
      previousLoad: previous.loadAvg,
      currentEnergy: current.energy,
      previousEnergy: previous.energy,
    }),
  };
}

export function buildProductivityData(input: ProductivityDataInput): {
  data: CompactPeriodMetrics;
  isEmpty: boolean;
} {
  const currentSessions = sessionsInRange(input.sessions, input.currentRange);
  const currentEnergy = energyLogsInRange(input.energyLogs, input.currentRange);
  const currentNotes = focusNotesInRange(input.focusNotes, input.currentRange);
  const isEmpty = !bundleHasData({
    sessions: currentSessions,
    energyLogs: currentEnergy,
    focusNotes: currentNotes,
  });

  const summary = summarizeSessionSet(currentSessions);
  const energy =
    input.mode === "today" ? currentEnergy[0]?.energy ?? null : averageEnergy(currentEnergy);
  const previousSessions = sessionsInRange(input.sessions, input.previousRange);
  const previousEnergyLogs = energyLogsInRange(input.energyLogs, input.previousRange);
  const previousNotes = focusNotesInRange(input.focusNotes, input.previousRange);
  const previousSummary = summarizeSessionSet(previousSessions);
  const previousEnergy =
    input.mode === "today" ? previousEnergyLogs[0]?.energy ?? null : averageEnergy(previousEnergyLogs);

  const headline = {
    hoursWorked: summary.hours,
    deepWorkHours: summary.deepWorkHours,
    routineHours: summary.routineHours,
    productivityAvg: summary.productivityAvg,
    loadAvg: summary.loadAvg,
    energy,
  };

  const data: CompactPeriodMetrics = {
    period: input.mode,
    ...headline,
    notes: collectNotes(currentNotes, currentEnergy, input.mode !== "today"),
    loadBands: compactLoadBands(currentSessions),
    comparedToPrevious: buildComparison(input.mode, headline, {
      hoursWorked: previousSummary.hours,
      productivityAvg: previousSummary.productivityAvg,
      loadAvg: previousSummary.loadAvg,
      energy: previousEnergy,
      noteCount: collectNotes(previousNotes, previousEnergyLogs, false).length,
    }),
    productivityTrend: productivityTrendFromAverages(headline.productivityAvg, previousSummary.productivityAvg),
  };

  if (input.mode === "week" || input.mode === "ask") {
    data.days = compactDays({
      sessions: currentSessions,
      energyLogs: currentEnergy,
      focusNotes: currentNotes,
    });
  }
  if (input.mode === "trends") {
    data.weeks = weeklyAggregates({
      sessions: currentSessions,
      energyLogs: currentEnergy,
      range: input.currentRange,
    });
  }
  if (input.mode === "ask") {
    data.question = input.question ?? "";
  }
  if (shouldIncludeBlocks(input.mode, input.question)) {
    const todaySessions = currentSessions.filter((session) => session.date === input.localDate);
    const blocks = collectTodayBlocks(todaySessions);
    if (blocks.length > 0) {
      data.blocks = blocks;
    }
  }

  return { data, isEmpty };
}
