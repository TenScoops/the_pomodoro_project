import type { PostgrestError } from "@supabase/supabase-js";
import type {
  BlockRatingInsert,
  BlockRatingRow,
  SessionInsert,
  SessionRow,
  SessionUpdate,
  SessionWithRatings,
} from "../types/pomoprogress";
import { supabase } from "../lib/supabaseClient";
import { todayLocalISODate } from "../lib/calendarDates";
import { ACTIVE_SESSION_ID_STORAGE_KEY, useSessionStore } from "../store/sessionStore";

// --- Helpers ---

/**
 * Finds a legacy draft `sessions` row for today (`sessions_completed = 0`) — e.g. after an older client
 * created drafts per block. Used by cancel to delete orphan rows.
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
 * Deletes your `sessions` rows for a calendar day (CASCADE removes `block_ratings`). RLS applies; no-op if not signed in.
 */
export async function deleteMySessionsForCalendarDate(
  isoDate: string
): Promise<{ error: PostgrestError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: null };
  }
  const { error } = await supabase.from("sessions").delete().eq("date", isoDate);
  return { error };
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

// --- API ---

export async function insertSession(
  payload: SessionInsert
): Promise<{ data: SessionRow | null; error: PostgrestError | null }> {
  const response = await supabase
    .from("sessions")
    .insert(payload)
    .select()
    .single();

  return {
    data: response.data as SessionRow | null,
    error: response.error,
  };
}

export async function insertBlockRating(
  payload: BlockRatingInsert
): Promise<{ data: BlockRatingRow | null; error: PostgrestError | null }> {
  const response = await supabase
    .from("block_ratings")
    .insert(payload)
    .select()
    .single();

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
 * Signed-in users: `Rating` already stores each score in `localStorage`. Nothing is written to Supabase
 * until the full pomodoro session completes — see `finalizeActivePomodoroSession` →
 * `persistCompletedPomodoroSessionBulkInsert`. Guests never hit the DB here (`getUser()` is null).
 */
export async function logBlockRatingForCurrentSession(
  _blockNumber: number,
  _rating: number
): Promise<{ error: PostgrestError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: null };
  }

  return { error: null };
}

/**
 * Clears in-memory ratings and removes any legacy draft `sessions` row for today (older clients
 * created drafts incrementally). Completed sessions are never deleted here.
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
      await supabase.from("sessions").delete().eq("id", sessionId);
    }
    store.setActiveSupabaseSessionId(null);
  }

  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    window.localStorage.removeItem(String(blockIndex));
  }

  store.bumpChartDataRevision();
}

/**
 * Sessions whose `date` falls in the given calendar month (RLS limits rows to the logged-in user).
 * @param monthOneThroughTwelve January = 1, December = 12
 */
export async function getSessionsByMonth(
  year: number,
  monthOneThroughTwelve: number
): Promise<{ data: SessionRow[]; error: PostgrestError | null }> {
  const { startDate, endDate } = getMonthDateRange(
    year,
    monthOneThroughTwelve
  );

  const response = await supabase
    .from("sessions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    data: (response.data ?? []) as SessionRow[],
    error: response.error,
  };
}

/**
 * Sessions whose `date` falls in the given calendar year.
 */
export async function getSessionsByYear(
  year: number
): Promise<{ data: SessionRow[]; error: PostgrestError | null }> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const response = await supabase
    .from("sessions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    data: (response.data ?? []) as SessionRow[],
    error: response.error,
  };
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
 * After the last block is rated: persist one `sessions` row + all `block_ratings` from `localStorage`.
 * No Supabase session row exists before this (signed-in path).
 */
export async function finalizeActivePomodoroSession(): Promise<{
  error: PostgrestError | Error | null;
  skipped: boolean;
}> {
  const store = useSessionStore.getState();
  const numOfBlocks = store.numOfBreaks + 1;

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

  store.setActiveSupabaseSessionId(null);

  return persistCompletedPomodoroSessionBulkInsert();
}

/**
 * Single transaction path for a completed session: insert `sessions`, then each `block_ratings` row.
 * Requires every block `1..numOfBlocks` to have a rating in `localStorage`.
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
      return {
        error: new Error(
          `Cannot save session: missing rating for block ${blockIndex} of ${numOfBlocks}.`
        ),
        skipped: false,
      };
    }
    const rating = Number(raw);
    if (Number.isNaN(rating)) {
      return {
        error: new Error(`Cannot save session: invalid rating for block ${blockIndex}.`),
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
    return { error: sessionInsertError, skipped: false };
  }

  for (const { blockNumber, rating } of ratings) {
    const { error: ratingError } = await insertBlockRating({
      session_id: sessionRow.id,
      block_number: blockNumber,
      rating,
    });

    if (ratingError) {
      return { error: ratingError, skipped: false };
    }
  }

  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    window.localStorage.removeItem(String(blockIndex));
  }

  store.bumpChartDataRevision();
  return { error: null, skipped: false };
}

