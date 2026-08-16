import type { BlockRatingNested, SessionWithRatings } from "../../types/pomoprogress";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import { buildEnergyLoadSeries, energyLoadSeriesHasData } from "./statsEnergyLoadSeries";

function sessionOnDate(date: string, ratings: BlockRatingNested[]): SessionWithRatings {
  return {
    id: `session-${date}`,
    user_id: "user-1",
    date,
    total_time_worked: ratings.reduce((total, rating) => total + (rating.duration_seconds ?? 0), 0),
    sessions_completed: 1,
    blocks_completed: ratings.length,
    created_at: `${date}T12:00:00.000Z`,
    block_ratings: ratings,
  };
}

function energyLog(date: string, energy: EnergyLogRecord["energy"]): EnergyLogRecord {
  return { id: `energy-${date}`, date, energy, note: "" };
}

describe("buildEnergyLoadSeries", () => {
  it("puts energy and weighted load on the matching day and leaves other days null", () => {
    const points = buildEnergyLoadSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-03",
      energyLogs: [energyLog("2026-08-02", 4)],
      sessions: [
        sessionOnDate("2026-08-02", [
          {
            block_number: 1,
            rating: 8,
            load: 4,
            work_type: "Deep Work",
            duration_seconds: 3600,
          },
        ]),
      ],
    });

    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ label: expect.any(String), energy: null, load: null });
    expect(points[1]?.energy).toBe(4);
    expect(points[1]?.load).toBe(4);
    expect(points[2]?.energy).toBeNull();
    expect(points[2]?.load).toBeNull();
  });

  it("halves Routine pull on the daily load average", () => {
    const points = buildEnergyLoadSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      energyLogs: [],
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
    expect(points[0]?.load).toBe(4.2);
  });

  it("ignores energy logs outside the range", () => {
    const points = buildEnergyLoadSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      energyLogs: [energyLog("2026-07-31", 5), energyLog("2026-08-01", 2)],
      sessions: [],
    });

    expect(points[0]?.energy).toBe(2);
  });
});

describe("energyLoadSeriesHasData", () => {
  it("is empty when every day has neither energy nor load", () => {
    expect(
      energyLoadSeriesHasData([
        { label: "Aug 1", energy: null, load: null },
        { label: "Aug 2", energy: null, load: null },
      ])
    ).toBe(false);
  });

  it("is true when only energy exists", () => {
    expect(energyLoadSeriesHasData([{ label: "Aug 1", energy: 3, load: null }])).toBe(true);
  });
});
