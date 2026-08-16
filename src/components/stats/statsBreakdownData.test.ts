import type { BlockRatingNested, SessionWithRatings } from "../../types/pomoprogress";
import {
  buildLoadBarsFromSessions,
  buildWorkTypeSlicesFromSessions,
  loadBandLevel,
  percentsThatSumTo100,
} from "./statsBreakdownData";

function sessionWithRatings(ratings: BlockRatingNested[]): SessionWithRatings {
  return {
    id: "session-1",
    user_id: "user-1",
    date: "2026-08-01",
    total_time_worked: ratings.reduce((total, rating) => total + (rating.duration_seconds ?? 0), 0),
    sessions_completed: 1,
    blocks_completed: ratings.length,
    created_at: "2026-08-01T12:00:00.000Z",
    block_ratings: ratings,
  };
}

function rating(partial: Partial<BlockRatingNested> & Pick<BlockRatingNested, "load" | "duration_seconds">): BlockRatingNested {
  return {
    block_number: partial.block_number ?? 1,
    rating: partial.rating ?? 8,
    load: partial.load,
    work_type: partial.work_type ?? "Deep Work",
    duration_seconds: partial.duration_seconds,
  };
}

describe("loadBandLevel", () => {
  it("puts quarter steps into the mock ranges", () => {
    expect(loadBandLevel(1)).toBe(1);
    expect(loadBandLevel(1.75)).toBe(1);
    expect(loadBandLevel(2)).toBe(2);
    expect(loadBandLevel(2.75)).toBe(2);
    expect(loadBandLevel(4)).toBe(4);
    expect(loadBandLevel(4.75)).toBe(4);
    expect(loadBandLevel(5)).toBe(5);
  });

  it("ignores scores outside 1–5", () => {
    expect(loadBandLevel(0.75)).toBeNull();
    expect(loadBandLevel(5.25)).toBeNull();
  });
});

describe("percentsThatSumTo100", () => {
  it("matches the mock By Load mix", () => {
    expect(percentsThatSumTo100([8.1, 22.3, 24.7, 10.2, 2.8])).toEqual([12, 33, 36, 15, 4]);
  });

  it("keeps empty bands at 0%", () => {
    expect(percentsThatSumTo100([2, 0, 2])).toEqual([50, 0, 50]);
  });
});

describe("buildLoadBarsFromSessions", () => {
  it("sums hours by rated load band and skips blocks with no load or duration", () => {
    const sessions = [
      sessionWithRatings([
        rating({ load: 5, duration_seconds: 8.1 * 3600 }),
        rating({ load: 4.75, duration_seconds: 22.3 * 3600 }),
        rating({ load: 3.25, duration_seconds: 24.7 * 3600 }),
        rating({ load: 2, duration_seconds: 10.2 * 3600 }),
        rating({ load: 1.5, duration_seconds: 2.8 * 3600 }),
        rating({ load: null, duration_seconds: 3600 }),
        rating({ load: 4, duration_seconds: 0 }),
      ]),
    ];

    const bars = buildLoadBarsFromSessions(sessions);
    expect(bars.map((bar) => bar.percent)).toEqual([12, 33, 36, 15, 4]);
    expect(bars[0]?.hours).toBe(8.1);
    expect(bars[1]?.hours).toBe(22.3);
    expect(bars[2]?.label).toBe("Moderate");
  });
});

describe("buildWorkTypeSlicesFromSessions", () => {
  it("splits Deep Work and Routine hours", () => {
    const sessions = [
      sessionWithRatings([
        rating({ load: 4, work_type: "Deep Work", duration_seconds: 41.2 * 3600 }),
        rating({ load: 2, work_type: "Routine", duration_seconds: 26.9 * 3600 }),
      ]),
    ];
    const result = buildWorkTypeSlicesFromSessions(sessions);
    expect(result.totalHours).toBe(68.1);
    expect(result.slices[0]?.hours).toBe(41.2);
    expect(result.slices[1]?.hours).toBe(26.9);
    expect(result.slices[0]?.percent + (result.slices[1]?.percent ?? 0)).toBe(100);
  });
});
