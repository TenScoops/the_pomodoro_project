import { ACTIVE_SESSION_ID_STORAGE_KEY } from "../../store/sessionStore";

export function resolveActiveSessionIdFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACTIVE_SESSION_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Guest ratings use `localStorage` keys `"1"`…`"N"` with no date — cap how many we strip when clearing. */
export const LOCAL_BLOCK_RATING_KEY_MAX = 48;

/**
 * Removes guest block rating keys from `localStorage` (`"1"`…`"N"`). Keys are not date-stamped, so this clears all guest scores in that range, not only “today”.
 */
export function clearGuestBlockRatingLocalStorage(): number {
  if (typeof window === "undefined" || !window.localStorage) {
    return 0;
  }
  let cleared = 0;
  for (let blockIndex = 1; blockIndex <= LOCAL_BLOCK_RATING_KEY_MAX; blockIndex++) {
    const key = String(blockIndex);
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
      cleared += 1;
    }
  }
  return cleared;
}

/**
 * After `blockNumber` work blocks are rated, cumulative net work seconds attributed so far this session.
 * Matches proportional spread used before final `total_time_worked` at finalize.
 */
export function cumulativeWorkSecondsAfterRatedBlocks(
  workMinutes: number,
  numOfBreaks: number,
  breakMinutes: number,
  blockNumber: number
): number {
  const numOfBlocks = numOfBreaks + 1;
  const totalBreakTimeMinutes = numOfBreaks * breakMinutes;
  const netWorkMinutes = workMinutes * 60 - totalBreakTimeMinutes;
  const totalSeconds = Math.max(0, Math.round(netWorkMinutes * 60));
  if (numOfBlocks <= 0 || blockNumber <= 0) {
    return 0;
  }
  const cappedBlocks = Math.min(blockNumber, numOfBlocks);
  return Math.round((totalSeconds * cappedBlocks) / numOfBlocks);
}
