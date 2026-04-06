import type { PostgrestError } from "@supabase/supabase-js";
import type {
  BlockRatingInsert,
  BlockRatingRow,
  SessionInsert,
  SessionRow,
  SessionUpdate,
  SessionWithRatings,
} from "../types/pomoprogress";
import { showDataLoggingAlert } from "../lib/dataLoggingAlerts";
import { supabase } from "../lib/supabaseClient";
import { todayLocalISODate } from "../lib/calendarDates";
import { ACTIVE_SESSION_ID_STORAGE_KEY, useSessionStore } from "../store/sessionStore";

function alertBlockFailure(detail: string): void {
  showDataLoggingAlert("Block rating not saved", detail);
}

function alertSessionUpdateFailure(detail: string): void {
  showDataLoggingAlert("Session could not be updated", detail);
}

function alertSessionFinalizeFailure(detail: string): void {
  showDataLoggingAlert("Session could not be completed", detail);
}

function alertHoursFailure(detail: string): void {
  showDataLoggingAlert("Hours not saved correctly", detail);
}

function alertSessionTooEarly(detail: string): void {
  showDataLoggingAlert("Session marked complete too early", detail);
}

// --- Helpers ---

/**
 * Draft `sessions` row for today (`sessions_completed = 0`) — in-progress run. Used by finalize/cancel
 * if `activeSupabaseSessionId` was lost from memory, and to clean up on cancel.
 */
export async function findLatestDraftSessionIdForUser(userId: string): Promise<string | null> {
  const today = todayLocalISODate();
  const response = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("date", today)
    .eq("sessions_completed", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = response.data as { id: string } | null;
  return row?.id ?? null;
}

function resolveActiveSessionIdFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACTIVE_SESSION_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Inclusive first and last calendar dates (YYYY-MM-DD) for a month (1–12). */
function getMonthDateRange(
  year: number,
  monthOneThroughTwelve: number
): { startDate: string; endDate: string } {
  if (
    monthOneThroughTwelve < 1 ||
    monthOneThroughTwelve > 12 ||
    !Number.isInteger(monthOneThroughTwelve)
  ) {
    throw new Error("month must be an integer from 1 to 12");
  }

  const monthPadded = String(monthOneThroughTwelve).padStart(2, "0");
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = new Date(year, monthOneThroughTwelve, 0);
  const dayPadded = String(lastDay.getDate()).padStart(2, "0");
  const endDate = `${year}-${monthPadded}-${dayPadded}`;

  return { startDate, endDate };
}

/** Guest ratings use `localStorage` keys `"1"`…`"N"` with no date — cap how many we strip when clearing. */
const LOCAL_BLOCK_RATING_KEY_MAX = 48;

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
 * Wipes server-side sessions for **today** (local date) when signed in, clears guest `localStorage` block keys, drops the active draft session id, and bumps chart revision.
 */
export async function clearTodaysRatingData(): Promise<{
  error: PostgrestError | null;
  localKeysCleared: number;
}> {
  const today = todayLocalISODate();
  const store = useSessionStore.getState();

  let error: PostgrestError | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const result = await supabase.from("sessions").delete().eq("date", today);
    error = result.error;
    store.setActiveSupabaseSessionId(null);
  }

  const localKeysCleared = clearGuestBlockRatingLocalStorage();
  store.bumpChartDataRevision();

  return { error, localKeysCleared };
}

// --- Session time (seconds) — matches Timer net work per session / per block ---

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

// --- API ---

export async function insertSession(
  payload: SessionInsert
): Promise<{ data: SessionRow | null; error: PostgrestError | null }> {
  const response = await supabase.from("sessions").insert(payload).select().single();

  return {
    data: response.data as SessionRow | null,
    error: response.error,
  };
}

export async function insertBlockRating(
  payload: BlockRatingInsert
): Promise<{ data: BlockRatingRow | null; error: PostgrestError | null }> {
  const response = await supabase.from("block_ratings").insert(payload).select().single();

  return {
    data: response.data as BlockRatingRow | null,
    error: response.error,
  };
}

export async function updateSession(
  id: string,
  patch: SessionUpdate
): Promise<{ error: PostgrestError | null; data: SessionRow | null }> {
  const response = await supabase
    .from("sessions")
    .update(patch)
    .eq("id", id)
    .select("id, user_id, date, total_time_worked, sessions_completed, blocks_completed, created_at")
    .maybeSingle();

  if (response.error) {
    return { error: response.error, data: null };
  }
  if (!response.data) {
    return {
      error: {
        name: "PostgrestError",
        message:
          "Session update matched no row (stale activeSupabaseSessionId, RLS, or wrong id). total_time_worked was not saved.",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
      data: null,
    };
  }
  return { error: null, data: response.data as SessionRow };
}

/**
 * Signed-in: on each score tap, insert `block_ratings` and update the draft `sessions` row (create draft on
 * first rating). Never sets `sessions_completed` here — completion only in finalize.
 * Guests only use `localStorage` (`Rating` writes keys before this runs).
 */
export async function logBlockRatingForCurrentSession(
  blockNumber: number,
  rating: number
): Promise<{ error: PostgrestError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: null };
  }

  const store = useSessionStore.getState();
  let sessionId = store.activeSupabaseSessionId;

  if (!sessionId) {
    const draftPayload: SessionInsert = {
      user_id: user.id,
      date: todayLocalISODate(),
      total_time_worked: 0,
      sessions_completed: 0,
      blocks_completed: 0,
    };
    const { data: created, error: createError } = await insertSession(draftPayload);
    if (createError || !created) {
      if (createError) {
        alertSessionUpdateFailure(createError.message);
      }
      return { error: createError };
    }
    sessionId = created.id;
    store.setActiveSupabaseSessionId(sessionId);
  }

  const { error: ratingError } = await insertBlockRating({
    session_id: sessionId,
    block_number: blockNumber,
    rating,
  });
  if (ratingError) {
    alertBlockFailure(ratingError.message);
    return { error: ratingError };
  }

  const totalTimeWorked = cumulativeWorkSecondsAfterRatedBlocks(
    store.workMinutes,
    store.numOfBreaks,
    store.breakMinutes,
    blockNumber
  );

  const { error: updateError } = await updateSession(sessionId, {
    blocks_completed: blockNumber,
    total_time_worked: totalTimeWorked,
  });
  if (updateError) {
    alertSessionUpdateFailure(updateError.message);
    return { error: updateError };
  }

  store.bumpChartDataRevision();
  return { error: null };
}

/**
 * Clears `localStorage` rating keys and clears the active draft session id from the client.
 * Deletes the draft `sessions` row only when it has **no** `block_ratings` yet — otherwise the row
 * stays so saved ratings are never removed (DB `on delete cascade` would wipe them).
 * Completed sessions (`sessions_completed = 1`) are never deleted here.
 */
export async function cancelActivePomodoroSession(): Promise<void> {
  const store = useSessionStore.getState();
  const numOfBlocks = store.numOfBreaks + 1;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let sessionId = store.activeSupabaseSessionId ?? resolveActiveSessionIdFromStorage();
    if (!sessionId) {
      sessionId = await findLatestDraftSessionIdForUser(user.id);
    }
    if (sessionId) {
      const { count, error: countError } = await supabase
        .from("block_ratings")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      if (!countError && (count ?? 0) === 0) {
        await supabase.from("sessions").delete().eq("id", sessionId);
      }
    }
    store.setActiveSupabaseSessionId(null);
  }

  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    window.localStorage.removeItem(String(blockIndex));
  }

  store.bumpChartDataRevision();
}

const sessionSelectWithRatings = `
  id,
  user_id,
  date,
  total_time_worked,
  sessions_completed,
  blocks_completed,
  created_at,
  block_ratings ( block_number, rating )
`;

/**
 * Sessions in a calendar month with per-block ratings (RLS limits to the signed-in user).
 */
export async function getSessionsWithRatingsForMonth(
  year: number,
  monthOneThroughTwelve: number
): Promise<{ data: SessionWithRatings[]; error: PostgrestError | null }> {
  const { startDate, endDate } = getMonthDateRange(year, monthOneThroughTwelve);

  const response = await supabase
    .from("sessions")
    .select(sessionSelectWithRatings)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as SessionWithRatings[],
    error: response.error,
  };
}

/**
 * Sessions in a calendar year with per-block ratings.
 */
export async function getSessionsWithRatingsForYear(
  year: number
): Promise<{ data: SessionWithRatings[]; error: PostgrestError | null }> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const response = await supabase
    .from("sessions")
    .select(sessionSelectWithRatings)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as SessionWithRatings[],
    error: response.error,
  };
}

/**
 * After the last block is rated: set final `total_time_worked` and `sessions_completed` on the draft row.
 * Block ratings were already inserted per tap via `logBlockRatingForCurrentSession`.
 * If no draft id is found (recovery), falls back to `persistCompletedPomodoroSessionBulkInsert`.
 */
export async function finalizeActivePomodoroSession(): Promise<{
  error: PostgrestError | Error | null;
  skipped: boolean;
}> {
  const store = useSessionStore.getState();
  const sessionIdFromStore = store.activeSupabaseSessionId;
  const numOfBlocks = store.numOfBreaks + 1;
  const totalBreakTimeMinutes = store.numOfBreaks * store.breakMinutes;
  const netWorkMinutes = store.workMinutes * 60 - totalBreakTimeMinutes;
  const totalTimeWorkedSeconds = Math.max(0, Math.round(netWorkMinutes * 60));

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError, skipped: true };
  }

  if (!user) {
    for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
      window.localStorage.removeItem(String(blockIndex));
    }
    return { error: null, skipped: true };
  }

  let sessionIdToFinalize =
    sessionIdFromStore ?? resolveActiveSessionIdFromStorage() ?? (await findLatestDraftSessionIdForUser(user.id));

  if (sessionIdToFinalize) {
    store.setActiveSupabaseSessionId(sessionIdToFinalize);
  }

  if (sessionIdToFinalize) {
    const { data: existingSession, error: fetchErr } = await supabase
      .from("sessions")
      .select("id, sessions_completed, blocks_completed")
      .eq("id", sessionIdToFinalize)
      .maybeSingle();

    if (fetchErr) {
      alertSessionFinalizeFailure(fetchErr.message);
      return { error: fetchErr, skipped: false };
    }

    const row = existingSession as { id: string; sessions_completed: number; blocks_completed: number } | null;
    if (row && row.sessions_completed === 1) {
      alertSessionTooEarly(
        "This session was already marked complete in the database before the final step. Charts may count it twice or show wrong hours."
      );
      return { error: new Error("Session already finalized"), skipped: false };
    }

    const patch = {
      total_time_worked: totalTimeWorkedSeconds,
      sessions_completed: 1,
      blocks_completed: numOfBlocks,
    };
    let { error } = await updateSession(sessionIdToFinalize, patch);
    if (error) {
      const recoveredId = await findLatestDraftSessionIdForUser(user.id);
      if (recoveredId) {
        store.setActiveSupabaseSessionId(recoveredId);
        ({ error } = await updateSession(recoveredId, patch));
      }
    }
    if (error) {
      alertSessionFinalizeFailure(error.message);
      return { error, skipped: false };
    }

    if (totalTimeWorkedSeconds === 0 && numOfBlocks > 0) {
      alertHoursFailure("Total focus time was saved as zero. Check work and break length settings.");
    }

    store.setActiveSupabaseSessionId(null);
    for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
      window.localStorage.removeItem(String(blockIndex));
    }
    store.bumpChartDataRevision();
    return { error: null, skipped: false };
  }

  return persistCompletedPomodoroSessionBulkInsert();
}

/**
 * Fallback when finalize runs but no draft `sessions` id exists (e.g. storage cleared): insert session +
 * ratings from `localStorage`. Normal path writes each rating on tap via `logBlockRatingForCurrentSession`.
 */
export async function persistCompletedPomodoroSessionBulkInsert(): Promise<{
  error: PostgrestError | Error | null;
  skipped: boolean;
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError, skipped: true };
  }
  if (!user) {
    return { error: null, skipped: true };
  }

  const store = useSessionStore.getState();

  const numOfBlocks = store.numOfBreaks + 1;
  const totalBreakTimeMinutes = store.numOfBreaks * store.breakMinutes;
  const netWorkMinutes = store.workMinutes * 60 - totalBreakTimeMinutes;
  const totalTimeWorkedSeconds = Math.max(0, Math.round(netWorkMinutes * 60));

  const sessionDate = todayLocalISODate();

  const ratings: { blockNumber: number; rating: number }[] = [];
  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    const raw = window.localStorage.getItem(String(blockIndex));
    if (raw === null) {
      const message = `Missing rating for block ${blockIndex} of ${numOfBlocks}.`;
      alertSessionFinalizeFailure(message);
      return {
        error: new Error(`Cannot save session: ${message}`),
        skipped: false,
      };
    }
    const rating = Number(raw);
    if (Number.isNaN(rating)) {
      const message = `Invalid rating for block ${blockIndex}.`;
      alertBlockFailure(message);
      return {
        error: new Error(`Cannot save session: ${message}`),
        skipped: false,
      };
    }
    ratings.push({ blockNumber: blockIndex, rating });
  }

  const sessionPayload: SessionInsert = {
    user_id: user.id,
    date: sessionDate,
    total_time_worked: totalTimeWorkedSeconds,
    sessions_completed: 1,
    blocks_completed: numOfBlocks,
  };

  const { data: sessionRow, error: sessionInsertError } = await insertSession(sessionPayload);

  if (sessionInsertError || !sessionRow) {
    if (sessionInsertError) {
      alertSessionFinalizeFailure(sessionInsertError.message);
    }
    return { error: sessionInsertError, skipped: false };
  }

  for (const { blockNumber, rating } of ratings) {
    const { error: ratingError } = await insertBlockRating({
      session_id: sessionRow.id,
      block_number: blockNumber,
      rating,
    });

    if (ratingError) {
      alertBlockFailure(ratingError.message);
      return { error: ratingError, skipped: false };
    }
  }

  if (totalTimeWorkedSeconds === 0 && numOfBlocks > 0) {
    alertHoursFailure("Total focus time was saved as zero. Check work and break length settings.");
  }

  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    window.localStorage.removeItem(String(blockIndex));
  }

  store.setActiveSupabaseSessionId(null);
  store.bumpChartDataRevision();
  return { error: null, skipped: false };
}
