import { supabase } from "../../lib/supabaseClient";
import { createQueryBuilder } from "../../testUtils/mockSupabaseQuery";
import { getDailyNoteForDate, getDailyNotesInRange, persistFocusNoteForToday } from "./dailyNotes";

jest.mock("../../lib/calendarDates", () => {
  const actual = jest.requireActual("../../lib/calendarDates");
  return {
    ...actual,
    todayLocalISODate: () => "2026-08-21",
  };
});

const mockedSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
};

describe("dailyNotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("is a no-op for guests", async () => {
    await expect(persistFocusNoteForToday("ship it")).resolves.toEqual({ error: null });
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it("deletes today's note when the text is empty", async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const builder = createQueryBuilder({ data: null, error: null });
    mockedSupabase.from.mockReturnValue(builder);

    const result = await persistFocusNoteForToday("   ");
    expect(result.error).toBeNull();
    expect(mockedSupabase.from).toHaveBeenCalledWith("daily_notes");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.eq).toHaveBeenCalledWith("date", "2026-08-21");
    expect(builder.upsert).not.toHaveBeenCalled();
  });

  it("upserts a trimmed note for the signed-in user", async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const builder = createQueryBuilder({ data: null, error: null });
    mockedSupabase.from.mockReturnValue(builder);

    await persistFocusNoteForToday("  focus on tests  ");
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        date: "2026-08-21",
        note: "focus on tests",
      }),
      { onConflict: "user_id,date" }
    );
  });

  it("reads one date and an inclusive range", async () => {
    const singleBuilder = createQueryBuilder({ data: { note: "hello" }, error: null });
    mockedSupabase.from.mockReturnValue(singleBuilder);
    await expect(getDailyNoteForDate("2026-08-21")).resolves.toEqual({
      note: "hello",
      error: null,
    });
    expect(singleBuilder.eq).toHaveBeenCalledWith("date", "2026-08-21");

    const rangeBuilder = createQueryBuilder({
      data: [{ date: "2026-08-20", note: "yesterday" }],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(rangeBuilder);
    const range = await getDailyNotesInRange("2026-08-01", "2026-08-31");
    expect(rangeBuilder.gte).toHaveBeenCalledWith("date", "2026-08-01");
    expect(rangeBuilder.lte).toHaveBeenCalledWith("date", "2026-08-31");
    expect(range.data).toEqual([{ date: "2026-08-20", note: "yesterday" }]);
  });
});
