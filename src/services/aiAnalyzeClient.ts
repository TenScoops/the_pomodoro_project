import { todayLocalISODate } from "../lib/calendarDates";
import type { AnalysisMode, AiAnalyzeResponseBody } from "../types/aiAnalysis";
import type { CompactPeriodMetrics } from "../types/aiMetrics";

export type AiAnalyzeClientResult =
  | { status: "ok"; text: string; metrics: CompactPeriodMetrics; interpretationError: string | null }
  | { status: "empty" }
  | { status: "error"; message: string };

interface RequestAiAnalysisOptions {
  mode: AnalysisMode;
  accessToken: string;
  question?: string;
  signal?: AbortSignal;
}

function errorMessageFromBody(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }
  return fallback;
}

export async function requestAiAnalysis(
  options: RequestAiAnalysisOptions
): Promise<AiAnalyzeClientResult> {
  let response: Response;
  try {
    response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.accessToken}`,
      },
      body: JSON.stringify({
        mode: options.mode,
        localDate: todayLocalISODate(),
        question: options.question,
      }),
      signal: options.signal,
    });
  } catch (unknownError: unknown) {
    if (options.signal?.aborted) {
      throw unknownError;
    }
    return {
      status: "error",
      message: "Could not reach the analysis server. Start the app with npm start so the API is running.",
    };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      status: "error",
      message: errorMessageFromBody(payload, "Analysis failed."),
    };
  }

  const body = payload as AiAnalyzeResponseBody;
  if (body.empty || !body.metrics) {
    return { status: "empty" };
  }
  return {
    status: "ok",
    text: typeof body.text === "string" ? body.text : "",
    metrics: body.metrics,
    interpretationError: body.interpretationError ?? null,
  };
}
