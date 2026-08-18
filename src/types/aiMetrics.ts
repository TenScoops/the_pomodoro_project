import type { AnalysisMode } from "./aiAnalysis";
import type { BlockWorkType } from "./pomoprogress";

export type ProductivityTrend = "up" | "down" | "flat";

export interface CompactLoadBand {
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
  hours: number;
}

export interface MetricDeltas {
  hoursWorked: number | null;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
}

export interface PeriodComparison {
  label: string;
  hoursWorked: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
  deltas: MetricDeltas;
}

export interface CompactBlock {
  blockNumber: number;
  workType: BlockWorkType | null;
  durationHours: number;
  productivity: number;
  load: number | null;
}

export interface CompactDayMetrics {
  date: string;
  hoursWorked: number;
  deepWorkHours: number;
  routineHours: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
}

export interface CompactWeekMetrics {
  weekStart: string;
  weekEnd: string;
  hoursWorked: number;
  deepWorkHours: number;
  routineHours: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
}

/**
 * Precomputed figures the app owns. The model may interpret these; it must not recalculate them.
 */
export interface CompactPeriodMetrics {
  period: AnalysisMode;
  hoursWorked: number;
  deepWorkHours: number;
  routineHours: number;
  productivityAvg: number | null;
  loadAvg: number | null;
  energy: number | null;
  notes: string[];
  loadBands: CompactLoadBand[];
  comparedToPrevious: PeriodComparison | null;
  productivityTrend: ProductivityTrend | null;
  days?: CompactDayMetrics[];
  weeks?: CompactWeekMetrics[];
  blocks?: CompactBlock[];
  question?: string;
}
