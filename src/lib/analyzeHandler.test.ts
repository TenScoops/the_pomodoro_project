import type { Request, Response } from "express";
import { handleAnalyze } from "../../server/analyzeHandler";
import { createUserSupabaseClient } from "../../server/supabaseUserClient";
import { fetchProductivityBundle } from "../../server/fetchProductivityData";

jest.mock("../../server/supabaseUserClient", () => ({
  createUserSupabaseClient: jest.fn(),
}));

jest.mock("../../server/fetchProductivityData", () => ({
  fetchProductivityBundle: jest.fn(),
}));

jest.mock("../../server/openaiClient", () => ({
  getOpenAIClient: jest.fn(),
  isOpenAIConfigured: jest.fn(() => false),
}));

const mockedCreateUserSupabaseClient = createUserSupabaseClient as jest.MockedFunction<
  typeof createUserSupabaseClient
>;
const mockedFetchProductivityBundle = fetchProductivityBundle as jest.MockedFunction<
  typeof fetchProductivityBundle
>;

function mockRequest(input: {
  authorization?: string;
  body?: Record<string, unknown>;
}): Request {
  return {
    headers: { authorization: input.authorization },
    body: input.body ?? {},
  } as Request;
}

function mockResponse(): Response & {
  status: jest.Mock;
  json: jest.Mock;
} {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
    headersSent: false,
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response as unknown as Response & { status: jest.Mock; json: jest.Mock };
}

describe("handleAnalyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests with no bearer token", async () => {
    const response = mockResponse();
    await handleAnalyze(mockRequest({ body: { mode: "today", localDate: "2026-08-21" } }), response);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: "Sign in to analyze your data." });
    expect(mockedCreateUserSupabaseClient).not.toHaveBeenCalled();
  });

  it("rejects a token that is not a Bearer value", async () => {
    const response = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Token abc",
        body: { mode: "today", localDate: "2026-08-21" },
      }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(mockedCreateUserSupabaseClient).not.toHaveBeenCalled();
  });

  it("rejects an invalid mode or localDate before hitting the database", async () => {
    const missingMode = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer test-token",
        body: { localDate: "2026-08-21" },
      }),
      missingMode
    );
    expect(missingMode.status).toHaveBeenCalledWith(400);
    expect(missingMode.json).toHaveBeenCalledWith({ error: "Send a valid mode and localDate." });

    const badDate = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer test-token",
        body: { mode: "today", localDate: "08-21-2026" },
      }),
      badDate
    );
    expect(badDate.status).toHaveBeenCalledWith(400);
    expect(mockedCreateUserSupabaseClient).not.toHaveBeenCalled();
  });

  it("requires a question in ask mode and caps its length", async () => {
    const emptyQuestion = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer test-token",
        body: { mode: "ask", localDate: "2026-08-21", question: "   " },
      }),
      emptyQuestion
    );
    expect(emptyQuestion.json).toHaveBeenCalledWith({ error: "Enter a question first." });

    const tooLong = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer test-token",
        body: { mode: "ask", localDate: "2026-08-21", question: "x".repeat(501) },
      }),
      tooLong
    );
    expect(tooLong.json).toHaveBeenCalledWith({
      error: "Keep your question under 500 characters.",
    });
    expect(mockedCreateUserSupabaseClient).not.toHaveBeenCalled();
  });

  it("rejects a bearer token whose user cannot be loaded", async () => {
    mockedCreateUserSupabaseClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "invalid token" },
        }),
      },
    } as never);

    const response = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer expired-token",
        body: { mode: "today", localDate: "2026-08-21" },
      }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(mockedFetchProductivityBundle).not.toHaveBeenCalled();
  });

  it("returns an empty result after auth when the date range has no data", async () => {
    mockedCreateUserSupabaseClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    } as never);
    mockedFetchProductivityBundle.mockResolvedValue({
      sessions: [],
      energyLogs: [],
      focusNotes: [],
    });

    const response = mockResponse();
    await handleAnalyze(
      mockRequest({
        authorization: "Bearer valid-token",
        body: { mode: "today", localDate: "2026-08-21" },
      }),
      response
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith({ text: "", empty: true, metrics: null });
  });
});
