import {
  compactLoadBands,
  metricDeltas,
  productivityTrendFromAverages,
  shouldIncludeBlocks,
} from "./aiAnalysisInsights";
import type { SessionWithRatings } from "../types/pomoprogress";

describe("compactLoadBands", () => {
  it("sums hours into the Stats load bands", () => {
    const sessions: SessionWithRatings[] = [
      {
        id: "s1",
        user_id: "user-1",
        date: "2026-08-18",
        total_time_worked: 4 * 3600,
        sessions_completed: 1,
        blocks_completed: 2,
        created_at: "2026-08-18T12:00:00.000Z",
        block_ratings: [
          {
            block_number: 1,
            rating: 8,
            load: 4.25,
            work_type: "Deep Work",
            duration_seconds: 3 * 3600,
          },
          {
            block_number: 2,
            rating: 10,
            load: 1.5,
            work_type: "Routine",
            duration_seconds: 3600,
          },
        ],
      },
    ];
    expect(compactLoadBands(sessions)).toEqual([
      { label: "Heavy", level: 4, hours: 3 },
      { label: "Very Light", level: 1, hours: 1 },
    ]);
  });
});

describe("productivityTrendFromAverages", () => {
  it("treats a small change as flat and a larger one as up or down", () => {
    expect(productivityTrendFromAverages(8.1, 8)).toBe("flat");
    expect(productivityTrendFromAverages(8.86, 6)).toBe("up");
    expect(productivityTrendFromAverages(6, 8)).toBe("down");
    expect(productivityTrendFromAverages(8, null)).toBeNull();
  });
});

describe("metricDeltas", () => {
  it("subtracts previous figures without inventing missing averages", () => {
    expect(
      metricDeltas({
        currentHours: 4,
        previousHours: 1,
        currentProductivity: 8.86,
        previousProductivity: 6,
        currentLoad: 3.71,
        previousLoad: null,
        currentEnergy: 4,
        previousEnergy: 3,
      })
    ).toEqual({
      hoursWorked: 3,
      productivityAvg: 2.86,
      loadAvg: null,
      energy: 1,
    });
  });
});

describe("shouldIncludeBlocks", () => {
  it("includes blocks for today, and for ask only when the question needs them", () => {
    expect(shouldIncludeBlocks("today")).toBe(true);
    expect(shouldIncludeBlocks("week")).toBe(false);
    expect(shouldIncludeBlocks("ask", "How was my week?")).toBe(false);
    expect(shouldIncludeBlocks("ask", "What happened in today's blocks?")).toBe(true);
  });
});
