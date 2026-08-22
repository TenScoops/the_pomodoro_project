import { supabase } from "../../lib/supabaseClient";
import { createQueryBuilder } from "../../testUtils/mockSupabaseQuery";
import {
  findLatestDraftSessionIdForUser,
  getLatestRatedSessionDateBefore,
  getSessionsWithRatingsForDate,
  getSessionsWithRatingsForMonth,
  getSessionsWithRatingsInRange,
} from "./sessionQueries";

jest.mock("../../lib/calendarDates", () => {
  const actual = jest.requireActual("../../lib/calendarDates");
  return {
    ...actual,
    todayLocalISODate: () => "2026-08-21",
  };
});

const mockedSupabase = supabase as unknown as {
  from: jest.Mock;
};

describe("sessionQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("asks for sessions between the inclusive range dates", async () => {
    const builder = createQueryBuilder({ data: [{ id: "s1" }], error: null });
    mockedSupabase.from.mockReturnValue(builder);

    const result = await getSessionsWithRatingsInRange("2026-08-01", "2026-08-31");
    expect(mockedSupabase.from).toHaveBeenCalledWith("sessions");
    expect(builder.gte).toHaveBeenCalledWith("date", "2026-08-01");
    expect(builder.lte).toHaveBeenCalledWith("date", "2026-08-31");
    expect(result.data).toEqual([{ id: "s1" }]);
    expect(result.error).toBeNull();
  });

  it("uses the real first and last day of the month, including February", async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    mockedSupabase.from.mockReturnValue(builder);

    await getSessionsWithRatingsForMonth(2026, 2);
    expect(builder.gte).toHaveBeenCalledWith("date", "2026-02-01");
    expect(builder.lte).toHaveBeenCalledWith("date", "2026-02-28");

    await getSessionsWithRatingsForMonth(2024, 2);
    expect(builder.lte).toHaveBeenCalledWith("date", "2024-02-29");
  });

  it("rejects a month outside 1–12", async () => {
    await expect(getSessionsWithRatingsForMonth(2026, 0)).rejects.toThrow(
      "month must be an integer from 1 to 12"
    );
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it("filters a single calendar date", async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    mockedSupabase.from.mockReturnValue(builder);
    await getSessionsWithRatingsForDate("2026-08-21");
    expect(builder.eq).toHaveBeenCalledWith("date", "2026-08-21");
  });

  it("returns the latest rated date before a cutoff", async () => {
    const builder = createQueryBuilder({ data: { date: "2026-08-18" }, error: null });
    mockedSupabase.from.mockReturnValue(builder);

    const result = await getLatestRatedSessionDateBefore("2026-08-21");
    expect(builder.gt).toHaveBeenCalledWith("blocks_completed", 0);
    expect(builder.lt).toHaveBeenCalledWith("date", "2026-08-21");
    expect(result).toEqual({ date: "2026-08-18", error: null });
  });

  it("finds today's latest draft session id", async () => {
    const builder = createQueryBuilder({ data: { id: "draft-1" }, error: null });
    mockedSupabase.from.mockReturnValue(builder);

    await expect(findLatestDraftSessionIdForUser("user-1")).resolves.toBe("draft-1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.eq).toHaveBeenCalledWith("date", "2026-08-21");
    expect(builder.eq).toHaveBeenCalledWith("sessions_completed", 0);
  });
});
