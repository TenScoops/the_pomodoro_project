import {
  weightedDailyLoad,
  weightedDailyProductivity,
  type LoadBlockInput,
  type ProductivityBlockInput,
} from "./effectiveLoad";
import type { BlockWorkType, SessionWithRatings } from "../types/pomoprogress";

export interface AnalysisEnergyLog {
  date: string;
  energy: number;
  note: string;
}

export interface AnalysisFocusNote {
  date: string;
  note: string;
}

export interface AnalysisSetSummary {
  hours: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  ratingCount: number;
  loadCount: number;
  deepWorkHours: number;
  routineHours: number;
}

export interface AnalysisDaySummary extends AnalysisSetSummary {
  date: string;
  energy: number | null;
  energyNote: string | null;
  focusNote: string | null;
}

export interface AnalysisBlock {
  blockNumber: number;
  workType: BlockWorkType | null;
  durationHours: number;
  productivity: number;
  load: number | null;
}

export function hoursFromSeconds(totalSeconds: number): number {
  if (totalSeconds <= 0) {
    return 0;
  }
  return Number((totalSeconds / 3600).toFixed(2));
}

export function summarizeSessionSet(sessions: SessionWithRatings[]): AnalysisSetSummary {
  const loadBlocks: LoadBlockInput[] = [];
  const productivityBlocks: ProductivityBlockInput[] = [];
  let totalSeconds = 0;
  let deepWorkSeconds = 0;
  let routineSeconds = 0;

  for (const session of sessions) {
    totalSeconds += session.total_time_worked;
    for (const rating of session.block_ratings ?? []) {
      loadBlocks.push({
        load: rating.load,
        workType: rating.work_type,
        durationSeconds: rating.duration_seconds,
      });
      productivityBlocks.push({
        rating: rating.rating,
        workType: rating.work_type,
        durationSeconds: rating.duration_seconds,
      });
      if (rating.work_type === "Routine") {
        routineSeconds += rating.duration_seconds ?? 0;
      } else if (rating.work_type === "Deep Work") {
        deepWorkSeconds += rating.duration_seconds ?? 0;
      }
    }
  }

  const loadSummary = weightedDailyLoad(loadBlocks);
  const productivitySummary = weightedDailyProductivity(productivityBlocks);

  return {
    hours: hoursFromSeconds(totalSeconds),
    productivityAvg: productivitySummary.ratingCount === 0 ? null : productivitySummary.productivityAvg,
    loadAvg: loadSummary.loadCount === 0 ? null : loadSummary.loadAvg,
    ratingCount: productivitySummary.ratingCount,
    loadCount: loadSummary.loadCount,
    deepWorkHours: hoursFromSeconds(deepWorkSeconds),
    routineHours: hoursFromSeconds(routineSeconds),
  };
}

function trimNote(note: string | null | undefined): string | null {
  const trimmed = note?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function groupSessionsByDate(sessions: SessionWithRatings[]): Map<string, SessionWithRatings[]> {
  const sessionsByDate = new Map<string, SessionWithRatings[]>();
  for (const session of sessions) {
    const existing = sessionsByDate.get(session.date) ?? [];
    existing.push(session);
    sessionsByDate.set(session.date, existing);
  }
  return sessionsByDate;
}

export function buildDaySummaries(input: {
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  focusNotes: AnalysisFocusNote[];
}): AnalysisDaySummary[] {
  const sessionsByDate = groupSessionsByDate(input.sessions);
  const energyByDate = new Map(input.energyLogs.map((log) => [log.date, log]));
  const notesByDate = new Map(input.focusNotes.map((row) => [row.date, row.note]));
  const dates = new Set<string>();
  sessionsByDate.forEach((_sessions, date) => dates.add(date));
  energyByDate.forEach((_log, date) => dates.add(date));
  notesByDate.forEach((_note, date) => dates.add(date));
  const sortedDates = Array.from(dates).sort();
  const summaries: AnalysisDaySummary[] = [];

  for (const date of sortedDates) {
    const daySessions = sessionsByDate.get(date) ?? [];
    const setSummary = summarizeSessionSet(daySessions);
    const energyLog = energyByDate.get(date);
    const focusNote = trimNote(notesByDate.get(date));
    const energyNote = trimNote(energyLog?.note);
    if (
      setSummary.hours === 0 &&
      setSummary.ratingCount === 0 &&
      energyLog == null &&
      focusNote == null
    ) {
      continue;
    }
    summaries.push({
      date,
      ...setSummary,
      energy: energyLog?.energy ?? null,
      energyNote,
      focusNote,
    });
  }

  return summaries;
}

export function collectTodayBlocks(sessions: SessionWithRatings[]): AnalysisBlock[] {
  const orderedSessions = [...sessions].sort((left, right) =>
    left.created_at.localeCompare(right.created_at)
  );
  const blocks: AnalysisBlock[] = [];
  for (const session of orderedSessions) {
    const ratings = [...(session.block_ratings ?? [])].sort(
      (left, right) => left.block_number - right.block_number
    );
    for (const rating of ratings) {
      blocks.push({
        blockNumber: rating.block_number,
        workType: rating.work_type,
        durationHours: hoursFromSeconds(rating.duration_seconds ?? 0),
        productivity: rating.rating,
        load: rating.load,
      });
    }
  }
  return blocks;
}

export function averageEnergy(logs: AnalysisEnergyLog[]): number | null {
  if (logs.length === 0) {
    return null;
  }
  let energySum = 0;
  for (const log of logs) {
    energySum += log.energy;
  }
  return Number((energySum / logs.length).toFixed(1));
}

export function bundleHasData(input: {
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  focusNotes: AnalysisFocusNote[];
}): boolean {
  const hasWork = input.sessions.some(
    (session) => session.total_time_worked > 0 || (session.block_ratings ?? []).length > 0
  );
  const hasEnergy = input.energyLogs.length > 0;
  const hasNotes = input.focusNotes.some((row) => trimNote(row.note) != null);
  return hasWork || hasEnergy || hasNotes;
}
