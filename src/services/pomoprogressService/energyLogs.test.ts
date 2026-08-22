import { supabase } from "../../lib/supabaseClient";
import { useSessionStore } from "../../store/sessionStore";
import { createQueryBuilder } from "../../testUtils/mockSupabaseQuery";
import { getEnergyLogs, getEnergyLogsInRange, persistEnergyLogForToday } from "./energyLogs";

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

describe("energyLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("does not write energy for a guest", async () => {
    const result = await persistEnergyLogForToday(4, "tired");
    expect(result.error).toEqual(expect.objectContaining({ message: "Sign in to save your energy." }));
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it("returns an empty list for a guest read", async () => {
    await expect(getEnergyLogs()).resolves.toEqual({ data: [], error: null });
    await expect(getEnergyLogsInRange("2026-08-01", "2026-08-31")).resolves.toEqual({
      data: [],
      error: null,
    });
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it("upserts today's energy and bumps chart data", async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const builder = createQueryBuilder({ data: null, error: null });
    mockedSupabase.from.mockReturnValue(builder);
    const revisionBefore = useSessionStore.getState().chartDataRevision;

    const result = await persistEnergyLogForToday(4.5, "  slept well  ");

    expect(result.error).toBeNull();
    expect(mockedSupabase.from).toHaveBeenCalledWith("energy_logs");
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        date: "2026-08-21",
        energy: 4.5,
        note: "slept well",
      }),
      { onConflict: "user_id,date" }
    );
    expect(useSessionStore.getState().chartDataRevision).toBe(revisionBefore + 1);
  });

  it("drops invalid energy rows and keeps Postgres numeric strings", async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockedSupabase.from.mockReturnValue(
      createQueryBuilder({
        data: [
          { id: "good", date: "2026-08-21", energy: "4.0", note: "" },
          { id: "bad", date: "2026-08-20", energy: 3.6, note: "" },
          { id: "nodate", date: "not-a-date", energy: 4, note: "" },
        ],
        error: null,
      })
    );

    const result = await getEnergyLogs();
    expect(result.error).toBeNull();
    expect(result.data).toEqual([{ id: "good", date: "2026-08-21", energy: 4, note: "" }]);
  });

  it("queries an inclusive date range for the signed-in user", async () => {
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    const builder = createQueryBuilder({
      data: [{ id: "aug", date: "2026-08-10T12:00:00.000Z", energy: 3.5, note: "ok" }],
      error: null,
    });
    mockedSupabase.from.mockReturnValue(builder);

    const result = await getEnergyLogsInRange("2026-08-01", "2026-08-31");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.gte).toHaveBeenCalledWith("date", "2026-08-01");
    expect(builder.lte).toHaveBeenCalledWith("date", "2026-08-31");
    expect(result.data).toEqual([{ id: "aug", date: "2026-08-10", energy: 3.5, note: "ok" }]);
  });
});
