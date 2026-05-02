/**
 * Pomodoro session + block rating persistence and chart queries.
 * Split across modules to stay within ~200 lines per file (see rules.md).
 */

export {
  clearGuestBlockRatingLocalStorage,
  cumulativeWorkSecondsAfterRatedBlocks,
} from "./sessionClientHelpers";

export { insertSession, updateSession, upsertBlockRating } from "./sessionMutations";

export {
  findLatestDraftSessionIdForUser,
  getLatestRatedSessionDateBefore,
  getSessionsWithRatingsForDate,
  getSessionsWithRatingsForMonth,
  getSessionsWithRatingsForYear,
} from "./sessionQueries";

export { clearTodaysRatingData } from "./sessionClear";
export { logBlockRatingForCurrentSession } from "./sessionRating";
export { cancelActivePomodoroSession } from "./sessionCancel";
export { finalizeActivePomodoroSession } from "./sessionFinalize";
export { persistCompletedPomodoroSessionBulkInsert } from "./sessionFinalizeBulk";
