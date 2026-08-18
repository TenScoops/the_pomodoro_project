import type { AnalysisMode } from "../src/types/aiAnalysis";

export const ANALYSIS_INSTRUCTIONS_BASE = `
You interpret precomputed productivity metrics for a personal productivity system.

The payload numbers are already calculated by the app. Do not calculate, recount, re-average, or invent statistics. Quote only figures that appear in the payload. Do not infer causal relationships the data does not support.

Your job: what patterns or useful interpretations can we draw from this?

Scales (already applied in the figures):
- productivityAvg = focus quality, 1–10, hours-weighted
- loadAvg = cognitive difficulty, 1–5, hours-weighted
- energy = daily state, 1–5
- Deep Work weight 1, Routine weight 0.5
`.trim();

const MODE_GUIDANCE: Record<AnalysisMode, string> = {
  today: "Interpret today's compact metrics. Blocks are extra context, not a prompt to recalculate averages.",
  week: "Interpret this week's compact metrics and daily summaries. Compare days using the provided figures only.",
  trends: "Interpret longer-term compact metrics, weekly rows, load bands, and the provided trend.",
  ask: "Answer the user's question using only the compact metrics. If they are not enough, say so.",
};

export function analysisInstructions(mode: AnalysisMode): string {
  return `${ANALYSIS_INSTRUCTIONS_BASE}

Mode: ${mode}.
${MODE_GUIDANCE[mode]}`;
}
