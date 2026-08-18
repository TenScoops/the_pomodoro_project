import type { BlockRatingNested, SessionWithRatings } from "../../types/pomoprogress";
import {
  buildHoursOverTimeSeries,
  hoursAxisMax,
  hoursOverTimeSeriesHasData,
} from "./statsHoursOverTimeSeries";

function sessionOnDate(
  date: string,
  ratings: BlockRatingNested[],
  totalSeconds?: number
): SessionWithRatings {
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

describe("buildHoursOverTimeSeries", () => {
  it("puts hours on the matching day and leaves other days at 0", () => {
    const points = buildHoursOverTimeSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-03",
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
    expect(points[0]?.hours).toBe(0);
    expect(points[1]?.hours).toBe(1);
    expect(points[2]?.hours).toBe(0);
  });

  it("sums multiple sessions on the same day", () => {
    const points = buildHoursOverTimeSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      sessions: [
        { ...sessionOnDate("2026-08-01", [], 1800), id: "session-morning" },
        { ...sessionOnDate("2026-08-01", [], 3600), id: "session-afternoon" },
      ],
    });

    expect(points[0]?.hours).toBe(1.5);
  });

  it("ignores sessions outside the range", () => {
    const points = buildHoursOverTimeSeries({
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-01",
      sessions: [
        sessionOnDate("2026-07-31", [], 7200),
        sessionOnDate("2026-08-01", [], 3600),
      ],
    });

    expect(points[0]?.hours).toBe(1);
  });
});

describe("hoursOverTimeSeriesHasData", () => {
  it("is empty when every day is 0 hours", () => {
    expect(
      hoursOverTimeSeriesHasData([
        { label: "Aug 1", hours: 0 },
        { label: "Aug 2", hours: 0 },
      ])
    ).toBe(false);
  });

  it("is true when any day has hours", () => {
    expect(hoursOverTimeSeriesHasData([{ label: "Aug 1", hours: 0.5 }])).toBe(true);
  });
});

describe("hoursAxisMax", () => {
  it("stays at 5 when the month is under 5 hours", () => {
    expect(hoursAxisMax([0, 4.2, 4.9])).toBe(5);
    expect(hoursAxisMax([5])).toBe(5);
  });

  it("steps up by 2 hours when a day goes past 5", () => {
    expect(hoursAxisMax([5.1])).toBe(6);
  });
});
