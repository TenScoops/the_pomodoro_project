import type { BlockRatingNested, SessionWithRatings } from "../../types/pomoprogress";
import { formatWorkTypeWithHours } from "../focus/recentDaysData";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import { buildDailyOverviewRows } from "./statsDailyOverviewData";

function sessionOnDate(date: string, ratings: BlockRatingNested[], totalSeconds?: number): SessionWithRatings {
  return {
    id: `session-${date}`,
    user_id: "user-1",
    date,
    total_time_worked:
      totalSeconds ?? ratings.reduce((total, rating) => total + (rating.duration_seconds ?? 0), 0),
    sessions_completed: 1,
    blocks_completed: ratings.length,
    created_at: `${date}T12:00:00.000Z`,
    block_ratings: ratings,
  };
}

function energyLog(date: string, energy: EnergyLogRecord["energy"], note: string): EnergyLogRecord {
  return { id: `energy-${date}`, date, energy, note };
}

describe("buildDailyOverviewRows", () => {
  it("builds newest work days first with hours, weighted load, and energy score", () => {
    const rows = buildDailyOverviewRows({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-14",
      energyLogs: [energyLog("2026-08-14", 4, "energy note must be ignored")],
      focusNotes: [{ date: "2026-08-14", note: "Focused on project" }],
      sessions: [
        sessionOnDate("2026-08-13", [
          {
            block_number: 1,
            rating: 7,
            load: 3,
            work_type: "Routine",
            duration_seconds: 3600,
          },
        ]),
        sessionOnDate("2026-08-14", [
          {
            block_number: 1,
            rating: 8,
            load: 4,
            work_type: "Deep Work",
            duration_seconds: 2 * 3600 + 18 * 60,
          },
        ]),
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.id).toBe("2026-08-14");
    expect(rows[0]?.dateLabel).toBe("August 14, 2026");
    expect(rows[0]?.workType).toBe("Deep Work");
    expect(rows[0]?.deepWorkSeconds).toBe(2 * 3600 + 18 * 60);
    expect(rows[0]?.routineSeconds).toBe(0);
    expect(rows[0]?.load).toBe(4);
    expect(rows[0]?.hours).toBe("2h 18m");
    expect(rows[0]?.energy).toBe(4);
    expect(rows[0]?.notes).toBe("Focused on project");
    expect(rows[1]?.workType).toBe("Routine");
    expect(rows[1]?.deepWorkSeconds).toBe(0);
    expect(rows[1]?.routineSeconds).toBe(3600);
    expect(rows[1]?.energy).toBeNull();
    expect(rows[1]?.notes).toBeNull();
  });

  it("uses Focus notes and never the energy log note", () => {
    const rows = buildDailyOverviewRows({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      energyLogs: [energyLog("2026-08-01", 3, "Felt drained after meetings")],
      focusNotes: [],
      sessions: [
        sessionOnDate("2026-08-01", [
          {
            block_number: 1,
            rating: 6,
            load: 2,
            work_type: "Routine",
            duration_seconds: 1800,
          },
        ]),
      ],
    });

    expect(rows[0]?.energy).toBe(3);
    expect(rows[0]?.notes).toBeNull();
  });

  it("marks mixed days Deep Work/Routine and halves Routine pull on load", () => {
    const rows = buildDailyOverviewRows({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      energyLogs: [],
      focusNotes: [{ date: "2026-08-01", note: "  Research and planning  " }],
      sessions: [
        sessionOnDate("2026-08-01", [
          {
            block_number: 1,
            rating: 9,
            load: 5,
            work_type: "Deep Work",
            duration_seconds: 7200,
          },
          {
            block_number: 2,
            rating: 10,
            load: 1,
            work_type: "Routine",
            duration_seconds: 3600,
          },
        ]),
      ],
    });

    // (5×2×1 + 1×1×0.5) / (2×1 + 1×0.5) = 10.5 / 2.5 = 4.2
    expect(rows[0]?.workType).toBe("Deep Work/Routine");
    expect(rows[0]?.deepWorkSeconds).toBe(7200);
    expect(rows[0]?.routineSeconds).toBe(3600);
    expect(
      formatWorkTypeWithHours(rows[0]?.workType ?? null, rows[0]?.deepWorkSeconds ?? 0, rows[0]?.routineSeconds ?? 0)
    ).toBe("Deep Work (2h) | Routine (1h)");
    expect(rows[0]?.load).toBe(4.2);
    expect(rows[0]?.notes).toBe("Research and planning");
  });

  it("skips days with no work even when energy or a Focus note exists", () => {
    const rows = buildDailyOverviewRows({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-02",
      energyLogs: [energyLog("2026-08-02", 5, "rest day")],
      focusNotes: [{ date: "2026-08-02", note: "Planning tomorrow" }],
      sessions: [],
    });

    expect(rows).toEqual([]);
  });

  it("ignores sessions outside the range", () => {
    const rows = buildDailyOverviewRows({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-31",
      energyLogs: [],
      focusNotes: [],
      sessions: [
        sessionOnDate("2026-07-31", [
          {
            block_number: 1,
            rating: 8,
            load: 3,
            work_type: "Deep Work",
            duration_seconds: 3600,
          },
        ]),
      ],
    });

    expect(rows).toEqual([]);
  });
});
