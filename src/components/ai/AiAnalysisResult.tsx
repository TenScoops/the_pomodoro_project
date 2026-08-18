import React from "react";
import type { CompactPeriodMetrics } from "../../types/aiMetrics";
import AiMetricsSummary from "./AiMetricsSummary";

export type AiAnalysisViewStatus = "idle" | "loading" | "error" | "empty" | "data";

interface AiAnalysisResultProps {
  status: AiAnalysisViewStatus;
  errorMessage: string;
  text: string;
  metrics: CompactPeriodMetrics | null;
  interpretationError: string | null;
}

export default function AiAnalysisResult({
  status,
  errorMessage,
  text,
  metrics,
  interpretationError,
}: AiAnalysisResultProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div className="aiAssistant__result" aria-live="polite" aria-busy={status === "loading"}>
      {status === "loading" && (
        <div className="aiAssistant__skeleton" role="status">
          <span className="aiAssistant__skeletonLabel">Analyzing your data…</span>
          <span className="aiAssistant__skeletonBar" />
          <span className="aiAssistant__skeletonBar" />
          <span className="aiAssistant__skeletonBar aiAssistant__skeletonBar--short" />
        </div>
      )}
      {status === "error" && (
        <p className="aiAssistant__message aiAssistant__message--error">{errorMessage}</p>
      )}
      {status === "empty" && (
        <p className="aiAssistant__message">
          There is no productivity, energy, or notes in this range yet.
        </p>
      )}
      {status === "data" && metrics && (
        <>
          <AiMetricsSummary metrics={metrics} />
          {interpretationError && (
            <p className="aiAssistant__message aiAssistant__message--error">{interpretationError}</p>
          )}
          {text ? (
            <div className="aiAssistant__interpretation">
              <h3 className="aiAssistant__interpretationTitle">Interpretation</h3>
              <p className="aiAssistant__output">{text}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
