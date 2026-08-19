import type { BlockRatingNested, SessionWithRatings } from "../types/pomoprogress";
import {
  collectRecordedBlocksFromSessions,
  pickPreviousBlockRating,
} from "./previousBlockRating";

function rating(
  partial: Partial<BlockRatingNested> & Pick<BlockRatingNested, "block_number" | "rating">
): BlockRatingNested {
  return {
    load: partial.load ?? 3,
    work_type: partial.work_type ?? "Deep Work",
    duration_seconds: partial.duration_seconds ?? 1500,
    ...partial,
  };
}

function session(partial: {
  id: string;
  created_at: string;
  ratings: BlockRatingNested[];
}): SessionWithRatings {
  return {
    id: partial.id,
    user_id: "user-1",
    date: "2026-08-19",
    total_time_worked: 1500,
    sessions_completed: 1,
    blocks_completed: partial.ratings.length,
    created_at: partial.created_at,
    block_ratings: partial.ratings,
  };
}

describe("pickPreviousBlockRating", () => {
  it("returns null when nothing has been recorded", () => {
    expect(pickPreviousBlockRating([], 1, "session-now")).toBeNull();
  });

  it("returns the last saved block of the current session when the current block is not saved yet", () => {
    const recorded = collectRecordedBlocksFromSessions([
      session({
        id: "session-now",
        created_at: "2026-08-19T12:00:00.000Z",
        ratings: [rating({ block_number: 1, rating: 8 })],
      }),
    ]);

    const previous = pickPreviousBlockRating(recorded, 2, "session-now");
    expect(previous?.blockNumber).toBe(1);
    expect(previous?.rating).toBe(8);
    expect(previous?.sessionId).toBe("session-now");
  });

  it("skips the current block after it was just rated and uses the one before it", () => {
    const recorded = collectRecordedBlocksFromSessions([
      session({
        id: "session-now",
        created_at: "2026-08-19T12:00:00.000Z",
        ratings: [
          rating({ block_number: 1, rating: 7 }),
          rating({ block_number: 2, rating: 9 }),
        ],
      }),
    ]);

    const previous = pickPreviousBlockRating(recorded, 2, "session-now");
    expect(previous?.blockNumber).toBe(1);
    expect(previous?.rating).toBe(7);
  });

  it("uses today's last recorded block when the current session has no ratings yet", () => {
    const recorded = collectRecordedBlocksFromSessions([
      session({
        id: "session-morning",
        created_at: "2026-08-19T09:00:00.000Z",
        ratings: [
          rating({ block_number: 1, rating: 6, work_type: "Routine" }),
          rating({ block_number: 2, rating: 8, work_type: "Deep Work" }),
        ],
      }),
    ]);

    const previous = pickPreviousBlockRating(recorded, 1, null);
    expect(previous?.sessionId).toBe("session-morning");
    expect(previous?.blockNumber).toBe(2);
    expect(previous?.workType).toBe("Deep Work");
  });

  it("returns the earlier session's last block when the current block was just saved on a new session", () => {
    const recorded = collectRecordedBlocksFromSessions([
      session({
        id: "session-morning",
        created_at: "2026-08-19T09:00:00.000Z",
        ratings: [rating({ block_number: 2, rating: 8 })],
      }),
      session({
        id: "session-now",
        created_at: "2026-08-19T14:00:00.000Z",
        ratings: [rating({ block_number: 1, rating: 5 })],
      }),
    ]);

    const previous = pickPreviousBlockRating(recorded, 1, "session-now");
    expect(previous?.sessionId).toBe("session-morning");
    expect(previous?.blockNumber).toBe(2);
  });

  it("skips the current guest block and keeps the one before it", () => {
    const recorded = [
      {
        sessionId: null,
        blockNumber: 1,
        rating: 6,
        load: 2,
        workType: "Routine" as const,
        durationSeconds: null,
      },
      {
        sessionId: null,
        blockNumber: 2,
        rating: 9,
        load: 4,
        workType: "Deep Work" as const,
        durationSeconds: null,
      },
    ];

    const previous = pickPreviousBlockRating(recorded, 2, null);
    expect(previous?.blockNumber).toBe(1);
    expect(previous?.workType).toBe("Routine");
  });
});
