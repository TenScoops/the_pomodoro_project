export type StatsSummaryCardId = "hours" | "energy" | "load" | "productivity";

export type StatsSummaryCard = {
  id: StatsSummaryCardId;
  label: string;
  value: string;
  suffix: string | null;
  /** Null until we compare against the previous period. */
  trendPercent: number | null;
};
