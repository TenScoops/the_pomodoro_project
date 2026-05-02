import type { PostgrestError } from "@supabase/supabase-js";
import type { SessionInsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import { alertBlockFailure, alertHoursFailure, alertSessionFinalizeFailure } from "./alerts";
import { insertSession, upsertBlockRating } from "./sessionMutations";

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
    const { error: ratingError } = await upsertBlockRating({
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
