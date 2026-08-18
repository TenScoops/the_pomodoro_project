import type { CompactPeriodMetrics } from "./aiMetrics";

export type AnalysisMode = "today" | "week" | "trends" | "ask";

export const ANALYSIS_MODES: readonly AnalysisMode[] = ["today", "week", "trends", "ask"];

export interface AiAnalyzeRequestBody {
  mode: AnalysisMode;
  /** User's local calendar day (YYYY-MM-DD), so "today" matches the app, not the server clock. */
  localDate: string;
  question?: string;
}

export interface AiAnalyzeResponseBody {
  text: string;
  empty: boolean;
  /** Formula-owned numbers for the UI. Null when the range has nothing to show. */
  metrics: CompactPeriodMetrics | null;
  interpretationError?: string;
}

export interface AiAnalyzeErrorBody {
  error: string;
}

export function isAnalysisMode(value: unknown): value is AnalysisMode {
  return value === "today" || value === "week" || value === "trends" || value === "ask";
}
