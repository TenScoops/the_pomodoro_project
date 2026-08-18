import React from "react";
import { formatFocusLoadNumber } from "../focus/recentDaysData";
import type { CompactPeriodMetrics } from "../../types/aiMetrics";

interface AiMetricsSummaryProps {
  metrics: CompactPeriodMetrics;
}

function hoursLabel(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

function signedDelta(value: number | null, suffix: string): string | null {
  if (value == null) {
    return null;
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

export default function AiMetricsSummary({ metrics }: AiMetricsSummaryProps) {
  const productivity =
    metrics.productivityAvg == null ? "—" : `${metrics.productivityAvg.toFixed(1)} / 10`;
  const load = metrics.loadAvg == null ? "—" : `${formatFocusLoadNumber(metrics.loadAvg)} / 5`;
  const energy = metrics.energy == null ? "—" : `${metrics.energy} / 5`;
  const comparison = metrics.comparedToPrevious;
  const hourDelta = signedDelta(comparison?.deltas.hoursWorked ?? null, "h");
  const prodDelta = signedDelta(comparison?.deltas.productivityAvg ?? null, "");
  const loadDelta = signedDelta(comparison?.deltas.loadAvg ?? null, "");

  return (
    <div className="aiAssistant__metrics">
      <dl className="aiAssistant__metricGrid">
        <div>
          <dt>Hours</dt>
          <dd>{hoursLabel(metrics.hoursWorked)}</dd>
        </div>
        <div>
          <dt>Productivity</dt>
          <dd>{productivity}</dd>
        </div>
        <div>
          <dt>Load</dt>
          <dd>{load}</dd>
        </div>
        <div>
          <dt>Energy</dt>
          <dd>{energy}</dd>
        </div>
      </dl>
      <p className="aiAssistant__metricSplit">
        Deep Work {hoursLabel(metrics.deepWorkHours)} · Routine {hoursLabel(metrics.routineHours)}
      </p>
      {comparison && (hourDelta || prodDelta || loadDelta) && (
        <p className="aiAssistant__metricCompare">
          vs {comparison.label}
          {hourDelta ? ` · hours ${hourDelta}` : ""}
          {prodDelta ? ` · prod ${prodDelta}` : ""}
          {loadDelta ? ` · load ${loadDelta}` : ""}
        </p>
      )}
    </div>
  );
}
