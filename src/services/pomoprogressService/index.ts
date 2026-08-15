/**
 * Pomodoro session + block rating persistence and chart queries.
 * Split across modules to stay within ~200 lines per file (see rules.md).
 */

export {
  clearGuestBlockRatingLocalStorage,
  cumulativeWorkSecondsAfterRatedBlocks,
  workSecondsForRatedBlock,
} from "./sessionClientHelpers";

export { insertSession, updateSession, upsertBlockRating } from "./sessionMutations";
export { persistFocusNoteForToday, getDailyNoteForDate, getDailyNotesInRange } from "./dailyNotes";

export {
  findLatestDraftSessionIdForUser,
  getLatestRatedSessionDateBefore,
  getSessionsWithRatingsForDate,
  getSessionsWithRatingsInRange,
  getSessionsWithRatingsForMonth,
  getSessionsWithRatingsForYear,
} from "./sessionQueries";

export { clearTodaysRatingData } from "./sessionClear";
export { logBlockRatingForCurrentSession } from "./sessionRating";
export { cancelActivePomodoroSession } from "./sessionCancel";
export { finalizeActivePomodoroSession } from "./sessionFinalize";
export { persistCompletedPomodoroSessionBulkInsert } from "./sessionFinalizeBulk";
