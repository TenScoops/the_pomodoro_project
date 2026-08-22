import type { BlockRatingNested, SessionWithRatings } from "../types/pomoprogress";
import {
  averageEnergy,
  buildDaySummaries,
  bundleHasData,
  collectTodayBlocks,
  summarizeSessionSet,
} from "./aiAnalysisDaySummary";

function rating(
  partial: Partial<BlockRatingNested> & Pick<BlockRatingNested, "rating">
): BlockRatingNested {
  return {
    block_number: partial.block_number ?? 1,
    rating: partial.rating,
    load: partial.load ?? 3,
    work_type: partial.work_type ?? "Deep Work",
    duration_seconds: partial.duration_seconds ?? 3600,
  };
}

function session(partial: {
  date: string;
  ratings?: BlockRatingNested[];
  totalSeconds?: number;
}): SessionWithRatings {
  const ratings = partial.ratings ?? [];
  return {
    id: `session-${partial.date}`,
    user_id: "user-1",
    date: partial.date,
    total_time_worked:
      partial.totalSeconds ??
      ratings.reduce((total, block) => total + (block.duration_seconds ?? 0), 0),
    sessions_completed: 1,
    blocks_completed: ratings.length,
    created_at: `${partial.date}T12:00:00.000Z`,
    block_ratings: ratings,
  };
}

describe("summarizeSessionSet", () => {
  it("uses the weighted productivity and load formulas", () => {
    const summary = summarizeSessionSet([
      session({
        date: "2026-08-18",
        ratings: [
          rating({ rating: 9, load: 4, work_type: "Deep Work", duration_seconds: 2 * 3600 }),
          rating({ rating: 8, load: 4.5, work_type: "Deep Work", duration_seconds: 3600 }),
          rating({ rating: 10, load: 1, work_type: "Routine", duration_seconds: 3600 }),
        ],
      }),
    ]);

    expect(summary.hours).toBe(4);
    expect(summary.deepWorkHours).toBe(3);
    expect(summary.routineHours).toBe(1);
    expect(summary.productivityAvg).toBe(8.86);
    expect(summary.loadAvg).toBe(3.71);
    expect(summary.ratingCount).toBe(3);
    expect(summary.loadCount).toBe(3);
  });

  it("returns null averages when nothing was rated", () => {
    const summary = summarizeSessionSet([session({ date: "2026-08-18", totalSeconds: 0 })]);
    expect(summary.productivityAvg).toBeNull();
    expect(summary.loadAvg).toBeNull();
    expect(summary.hours).toBe(0);
  });
});

describe("averageEnergy", () => {
  it("averages to one decimal and returns null for an empty list", () => {
    expect(averageEnergy([])).toBeNull();
    expect(
      averageEnergy([
        { date: "2026-08-01", energy: 3.5, note: "" },
        { date: "2026-08-02", energy: 4, note: "" },
      ])
    ).toBe(3.8);
  });
});

describe("bundleHasData", () => {
  it("is true when any of work, energy, or a real note exists", () => {
    expect(bundleHasData({ sessions: [], energyLogs: [], focusNotes: [] })).toBe(false);
    expect(
      bundleHasData({
        sessions: [],
        energyLogs: [],
        focusNotes: [{ date: "2026-08-18", note: "   " }],
      })
    ).toBe(false);
    expect(
      bundleHasData({
        sessions: [],
        energyLogs: [{ date: "2026-08-18", energy: 4, note: "" }],
        focusNotes: [],
      })
    ).toBe(true);
  });
});

describe("collectTodayBlocks", () => {
  it("orders sessions then block numbers", () => {
    const blocks = collectTodayBlocks([
      session({
        date: "2026-08-18",
        ratings: [rating({ block_number: 2, rating: 7 }), rating({ block_number: 1, rating: 8 })],
      }),
    ]);
    expect(blocks.map((block) => block.blockNumber)).toEqual([1, 2]);
    expect(blocks[0]?.durationHours).toBe(1);
  });
});

describe("buildDaySummaries", () => {
  it("keeps energy-only days and skips completely empty dates", () => {
    const days = buildDaySummaries({
      sessions: [session({ date: "2026-08-18", ratings: [rating({ rating: 8 })] })],
      energyLogs: [{ date: "2026-08-17", energy: 4, note: "rested" }],
      focusNotes: [{ date: "2026-08-16", note: "   " }],
    });

    expect(days.map((day) => day.date)).toEqual(["2026-08-17", "2026-08-18"]);
    expect(days[0]?.energy).toBe(4);
    expect(days[0]?.energyNote).toBe("rested");
    expect(days[1]?.productivityAvg).toBe(8);
  });
});
