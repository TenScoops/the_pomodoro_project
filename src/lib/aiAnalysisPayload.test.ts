import { buildProductivityData } from "./aiAnalysisPayload";
import type { BlockRatingNested, SessionWithRatings } from "../types/pomoprogress";

function sessionWithBlocks(date: string, ratings: BlockRatingNested[]): SessionWithRatings {
  const totalSeconds = ratings.reduce((sum, rating) => sum + (rating.duration_seconds ?? 0), 0);
  return {
    id: `session-${date}`,
    user_id: "user-1",
    date,
    total_time_worked: totalSeconds,
    sessions_completed: 1,
    blocks_completed: ratings.length,
    created_at: `${date}T12:00:00.000Z`,
    block_ratings: ratings,
  };
}

const todayRange = { startDate: "2026-08-18", endDate: "2026-08-18" };
const yesterdayRange = { startDate: "2026-08-17", endDate: "2026-08-17" };

describe("buildProductivityData", () => {
  it("marks an empty current period so OpenAI is not called", () => {
    const result = buildProductivityData({
      mode: "today",
      localDate: "2026-08-18",
      currentRange: todayRange,
      previousRange: yesterdayRange,
      sessions: [],
      energyLogs: [],
      focusNotes: [],
    });
    expect(result.isEmpty).toBe(true);
  });

  it("builds a compact today object from the weighted formulas", () => {
    const result = buildProductivityData({
      mode: "today",
      localDate: "2026-08-18",
      currentRange: todayRange,
      previousRange: yesterdayRange,
      sessions: [
        sessionWithBlocks("2026-08-18", [
          {
            block_number: 1,
            rating: 9,
            load: 4,
            work_type: "Deep Work",
            duration_seconds: 2 * 3600,
          },
          {
            block_number: 2,
            rating: 8,
            load: 4.5,
            work_type: "Deep Work",
            duration_seconds: 1 * 3600,
          },
          {
            block_number: 3,
            rating: 10,
            load: 1,
            work_type: "Routine",
            duration_seconds: 1 * 3600,
          },
        ]),
        sessionWithBlocks("2026-08-17", [
          {
            block_number: 1,
            rating: 6,
            load: 3,
            work_type: "Deep Work",
            duration_seconds: 3600,
          },
        ]),
      ],
      energyLogs: [{ date: "2026-08-18", energy: 4, note: "slept well" }],
      focusNotes: [{ date: "2026-08-18", note: "ship the AI panel" }],
    });

    expect(result.isEmpty).toBe(false);
    expect(result.data.period).toBe("today");
    expect(result.data.hoursWorked).toBe(4);
    expect(result.data.deepWorkHours).toBe(3);
    expect(result.data.routineHours).toBe(1);
    expect(result.data.productivityAvg).toBe(8.86);
    expect(result.data.loadAvg).toBe(3.71);
    expect(result.data.energy).toBe(4);
    expect(result.data.notes).toEqual(["ship the AI panel", "slept well"]);
    expect(result.data.blocks).toHaveLength(3);
    expect(result.data.days).toBeUndefined();
    expect(result.data.comparedToPrevious?.label).toBe("yesterday");
    expect(result.data.comparedToPrevious?.deltas.hoursWorked).toBe(3);
    expect(result.data.productivityTrend).toBe("up");
    expect(result.data.loadBands.some((band) => band.label === "Heavy" && band.hours === 3)).toBe(true);
    expect(result.data.loadBands.some((band) => band.label === "Very Light" && band.hours === 1)).toBe(true);
  });

  it("sends daily summaries for the week without block rows", () => {
    const result = buildProductivityData({
      mode: "week",
      localDate: "2026-08-18",
      currentRange: { startDate: "2026-08-17", endDate: "2026-08-18" },
      previousRange: { startDate: "2026-08-10", endDate: "2026-08-16" },
      sessions: [
        sessionWithBlocks("2026-08-17", [
          {
            block_number: 1,
            rating: 6,
            load: 3,
            work_type: "Deep Work",
            duration_seconds: 3600,
          },
        ]),
        sessionWithBlocks("2026-08-18", [
          {
            block_number: 1,
            rating: 8,
            load: 4,
            work_type: "Deep Work",
            duration_seconds: 3600,
          },
        ]),
      ],
      energyLogs: [],
      focusNotes: [],
    });

    expect(result.data.blocks).toBeUndefined();
    expect(result.data.days?.map((day) => day.date)).toEqual(["2026-08-17", "2026-08-18"]);
    expect(result.data.days?.[0]?.productivityAvg).toBe(6);
    expect(result.data.days?.[1]?.productivityAvg).toBe(8);
    expect(result.data.hoursWorked).toBe(2);
  });
});
