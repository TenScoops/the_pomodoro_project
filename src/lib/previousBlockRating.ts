import {
  LOCAL_BLOCK_RATING_KEY_MAX,
  localBlockLoadKey,
  readLocalBlockWorkType,
} from "../services/pomoprogressService/sessionClientHelpers";
import type { BlockWorkType, SessionWithRatings } from "../types/pomoprogress";

export interface PreviousBlockRating {
  sessionId: string | null;
  blockNumber: number;
  rating: number;
  load: number | null;
  workType: BlockWorkType | null;
  durationSeconds: number | null;
}

function readLocalProductivity(blockNumber: number): number | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(String(blockNumber));
  if (raw === null) {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1 || value > 10) {
    return null;
  }
  return value;
}

function readLocalLoad(blockNumber: number): number | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(localBlockLoadKey(blockNumber));
  if (raw === null) {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    return null;
  }
  return value;
}

/** Oldest session first, then block number, so the last item is the most recently recorded block. */
export function collectRecordedBlocksFromSessions(
  sessions: SessionWithRatings[]
): PreviousBlockRating[] {
  const orderedSessions = [...sessions].sort((left, right) =>
    left.created_at.localeCompare(right.created_at)
  );
  const recorded: PreviousBlockRating[] = [];

  for (const session of orderedSessions) {
    const ratings = [...(session.block_ratings ?? [])].sort(
      (left, right) => left.block_number - right.block_number
    );
    for (const rating of ratings) {
      recorded.push({
        sessionId: session.id,
        blockNumber: rating.block_number,
        rating: rating.rating,
        load: rating.load,
        workType: rating.work_type,
        durationSeconds: rating.duration_seconds,
      });
    }
  }

  return recorded;
}

export function collectRecordedBlocksFromLocalStorage(): PreviousBlockRating[] {
  const recorded: PreviousBlockRating[] = [];
  for (let blockNumber = 1; blockNumber <= LOCAL_BLOCK_RATING_KEY_MAX; blockNumber++) {
    const rating = readLocalProductivity(blockNumber);
    if (rating == null) {
      continue;
    }
    recorded.push({
      sessionId: null,
      blockNumber,
      rating,
      load: readLocalLoad(blockNumber),
      workType: readLocalBlockWorkType(blockNumber),
      durationSeconds: null,
    });
  }
  return recorded;
}

/**
 * The previous recorded block is the latest saved rating that is not the
 * current in-progress block of this session.
 */
export function pickPreviousBlockRating(
  recordedBlocks: PreviousBlockRating[],
  currentBlockNumber: number,
  currentSessionId: string | null
): PreviousBlockRating | null {
  if (recordedBlocks.length === 0) {
    return null;
  }

  const latest = recordedBlocks[recordedBlocks.length - 1];
  if (!latest) {
    return null;
  }
  const latestIsCurrentBlock =
    latest.blockNumber === currentBlockNumber && latest.sessionId === currentSessionId;

  if (latestIsCurrentBlock) {
    return recordedBlocks.length >= 2 ? recordedBlocks[recordedBlocks.length - 2] : null;
  }

  return latest;
}
