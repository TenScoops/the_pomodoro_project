import { supabase } from "../../lib/supabaseClient";
import { createQueryBuilder } from "../../testUtils/mockSupabaseQuery";
import {
  insertSession,
  syncSessionTotalsFromBlockRatings,
  updateBlockRatingScores,
  updateSession,
  upsertBlockRating,
} from "./sessionMutations";

const mockedSupabase = supabase as unknown as {
  from: jest.Mock;
};

const sessionRow = {
  id: "session-1",
  user_id: "user-1",
  date: "2026-08-21",
  total_time_worked: 0,
  sessions_completed: 0,
  blocks_completed: 0,
  created_at: "2026-08-21T12:00:00.000Z",
};

describe("sessionMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts a session and returns the row", async () => {
    const builder = createQueryBuilder({ data: sessionRow, error: null });
    mockedSupabase.from.mockReturnValue(builder);

    const result = await insertSession({
      user_id: "user-1",
      date: "2026-08-21",
      total_time_worked: 0,
      sessions_completed: 0,
      blocks_completed: 0,
    });

    expect(mockedSupabase.from).toHaveBeenCalledWith("sessions");
    expect(builder.insert).toHaveBeenCalled();
    expect(result).toEqual({ data: sessionRow, error: null });
  });

  it("upserts a block rating on the session/block unique key", async () => {
    const builder = createQueryBuilder({
      data: { id: "rating-1", session_id: "session-1", block_number: 1 },
      error: null,
    });
    mockedSupabase.from.mockReturnValue(builder);

    await upsertBlockRating({
      session_id: "session-1",
      block_number: 1,
      rating: 8,
      load: 4,
      work_type: "Deep Work",
      duration_seconds: 1500,
    });

    expect(mockedSupabase.from).toHaveBeenCalledWith("block_ratings");
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ session_id: "session-1", block_number: 1 }),
      { onConflict: "session_id,block_number" }
    );
  });

  it("treats a score update that matches no row as an error", async () => {
    mockedSupabase.from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

    const result = await updateBlockRatingScores("session-1", 2, {
      rating: 7,
      load: 3,
      work_type: "Routine",
    });

    expect(result.error?.code).toBe("PGRST116");
    expect(result.error?.message).toMatch(/matched no row/);
  });

  it("treats a session update that matches no row as an error", async () => {
    mockedSupabase.from.mockReturnValue(createQueryBuilder({ data: null, error: null }));

    const result = await updateSession("missing-id", { total_time_worked: 3000 });
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("PGRST116");
  });

  it("sums rated durations and writes those totals back onto the session", async () => {
    const ratingsBuilder = createQueryBuilder({
      data: [{ duration_seconds: 1500 }, { duration_seconds: 1500 }, { duration_seconds: null }],
      error: null,
    });
    const sessionBuilder = createQueryBuilder({ data: sessionRow, error: null });
    mockedSupabase.from.mockImplementation((tableName: string) =>
      tableName === "block_ratings" ? ratingsBuilder : sessionBuilder
    );

    const result = await syncSessionTotalsFromBlockRatings("session-1");
    expect(result).toEqual({ error: null, totalSeconds: 3000, blockCount: 3 });
    expect(sessionBuilder.update).toHaveBeenCalledWith({
      total_time_worked: 3000,
      blocks_completed: 3,
    });
  });
});
