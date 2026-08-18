import type { Request, Response } from "express";
import { APIError } from "openai";
import { analysisInstructions } from "./analysisInstructions";
import { fetchProductivityBundle } from "./fetchProductivityData";
import { getOpenAIClient, isOpenAIConfigured } from "./openaiClient";
import { createUserSupabaseClient } from "./supabaseUserClient";
import { buildProductivityData } from "../src/lib/aiAnalysisPayload";
import { fetchDateWindow } from "../src/lib/aiAnalysisRanges";
import { parseLocalISODate } from "../src/lib/calendarDates";
import { isAnalysisMode } from "../src/types/aiAnalysis";
import type { CompactPeriodMetrics } from "../src/types/aiMetrics";

const ASK_QUESTION_MAX_LENGTH = 500;

function readBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) {
    return null;
  }
  const match = /^Bearer\s+(\S+)/.exec(headerValue);
  return match?.[1] ?? null;
}

function jsonError(response: Response, status: number, error: string): void {
  response.status(status).json({ error });
}

function jsonResult(
  response: Response,
  body: {
    text: string;
    empty: boolean;
    metrics: CompactPeriodMetrics | null;
    interpretationError?: string;
  }
): void {
  response.json(body);
}

export async function handleAnalyze(request: Request, response: Response): Promise<void> {
  const accessToken = readBearerToken(request.headers.authorization);
  if (!accessToken) {
    jsonError(response, 401, "Sign in to analyze your data.");
    return;
  }

  const body = request.body as Record<string, unknown>;
  const mode = body.mode;
  const localDate = body.localDate;
  if (!isAnalysisMode(mode) || typeof localDate !== "string" || !parseLocalISODate(localDate)) {
    jsonError(response, 400, "Send a valid mode and localDate.");
    return;
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (mode === "ask" && question.length === 0) {
    jsonError(response, 400, "Enter a question first.");
    return;
  }
  if (question.length > ASK_QUESTION_MAX_LENGTH) {
    jsonError(response, 400, "Keep your question under 500 characters.");
    return;
  }

  const supabase = createUserSupabaseClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    jsonError(response, 401, "Sign in to analyze your data.");
    return;
  }

  const window = fetchDateWindow(mode, localDate);
  const bundle = await fetchProductivityBundle(supabase, window.startDate, window.endDate);
  const payload = buildProductivityData({
    mode,
    localDate,
    currentRange: window.current,
    previousRange: window.previous,
    question: mode === "ask" ? question : undefined,
    sessions: bundle.sessions,
    energyLogs: bundle.energyLogs,
    focusNotes: bundle.focusNotes,
  });

  if (payload.isEmpty) {
    jsonResult(response, { text: "", empty: true, metrics: null });
    return;
  }

  if (!isOpenAIConfigured()) {
    jsonResult(response, {
      text: "",
      empty: false,
      metrics: payload.data,
      interpretationError: "AI is not configured. Add OPENAI_API_KEY to the server environment.",
    });
    return;
  }

  try {
    const openai = getOpenAIClient();
    const completion = await openai.responses.create({
      model: "gpt-5",
      instructions: analysisInstructions(mode),
      input: JSON.stringify(payload.data),
    });
    const text = completion.output_text?.trim() ?? "";
    jsonResult(response, {
      text,
      empty: false,
      metrics: payload.data,
      interpretationError: text ? undefined : "No interpretation was returned.",
    });
  } catch (unknownError: unknown) {
    const message =
      unknownError instanceof APIError
        ? "The analysis service could not complete this request."
        : "Interpretation failed.";
    jsonResult(response, {
      text: "",
      empty: false,
      metrics: payload.data,
      interpretationError: message,
    });
  }
}

export async function analyzeRoute(request: Request, response: Response): Promise<void> {
  try {
    await handleAnalyze(request, response);
  } catch (unknownError: unknown) {
    if (response.headersSent) {
      return;
    }
    const message = unknownError instanceof Error ? unknownError.message : "Analysis failed.";
    jsonError(response, 500, message);
  }
}
