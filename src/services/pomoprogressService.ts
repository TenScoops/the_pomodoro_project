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
import { useSessionStore } from "../store/sessionStore";

// --- Helpers ---

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
): Promise<{ error: PostgrestError | null }> {
  const response = await supabase.from("sessions").update(patch).eq("id", id);
  return { error: response.error };
}

/**
 * When the user rates a block while signed in: ensure a draft `sessions` row exists,
 * insert `block_ratings`, and bump chart revision so My Data updates immediately.
 * Guests only use localStorage (handled in `Rating` before this runs).
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
    return { error: ratingError };
  }

  const { error: updateError } = await updateSession(sessionId, {
    blocks_completed: blockNumber,
  });
  if (updateError) {
    return { error: updateError };
  }

  store.bumpChartDataRevision();
  return { error: null };
}

/**
 * Remove draft session + ratings (CASCADE) when the user cancels mid-session.
 */
export async function cancelActivePomodoroSession(): Promise<void> {
  const store = useSessionStore.getState();
  const sessionId = store.activeSupabaseSessionId;
  const numOfBlocks = store.numOfBreaks + 1;

  if (sessionId) {
    await supabase.from("sessions").delete().eq("id", sessionId);
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
 * Finalize the active session after the last block: set total time and completion flags.
 * Block ratings were already saved per block via `logBlockRatingForCurrentSession`.
 * If there is no draft row but the user is signed in, falls back to a one-shot insert (legacy).
 */
export async function finalizeActivePomodoroSession(): Promise<{
  error: PostgrestError | Error | null;
  skipped: boolean;
}> {
  const store = useSessionStore.getState();
  const sessionId = store.activeSupabaseSessionId;
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

  if (sessionId) {
    const { error } = await updateSession(sessionId, {
      total_time_worked: totalTimeWorkedSeconds,
      sessions_completed: 1,
      blocks_completed: numOfBlocks,
    });
    store.setActiveSupabaseSessionId(null);
    for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
      window.localStorage.removeItem(String(blockIndex));
    }
    store.bumpChartDataRevision();
    return { error, skipped: false };
  }

  return persistCompletedPomodoroSessionBulkInsert();
}

/**
 * Legacy path: one session row + all block_ratings in one go (e.g. draft creation failed mid-run).
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
      continue;
    }
    const rating = Number(raw);
    if (!Number.isNaN(rating)) {
      ratings.push({ blockNumber: blockIndex, rating });
    }
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

