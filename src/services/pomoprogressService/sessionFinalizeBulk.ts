import type { PostgrestError } from "@supabase/supabase-js";
import type { BlockWorkType, SessionInsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import { alertBlockFailure, alertHoursFailure, alertSessionFinalizeFailure } from "./alerts";
import { clearLocalBlockKeysForSession, readLocalBlockLoad, readLocalBlockWorkType, workSecondsForRatedBlock } from "./sessionClientHelpers";
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
  const sessionDate = todayLocalISODate();

  const ratings: {
    blockNumber: number;
    rating: number;
    load: number;
    workType: BlockWorkType | null;
    durationSeconds: number;
  }[] = [];
  for (let blockIndex = 1; blockIndex <= numOfBlocks; blockIndex++) {
    const raw = window.localStorage.getItem(String(blockIndex));
    const load = readLocalBlockLoad(blockIndex);
    if (raw === null || load === null) {
      continue;
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
    ratings.push({
      blockNumber: blockIndex,
      rating,
      load,
      workType: readLocalBlockWorkType(blockIndex),
      durationSeconds: workSecondsForRatedBlock(
        store.workMinutes,
        store.numOfBreaks,
        store.breakMinutes,
        blockIndex
      ),
    });
  }

  if (ratings.length === 0) {
    clearLocalBlockKeysForSession(numOfBlocks);
    store.setActiveSupabaseSessionId(null);
    return { error: null, skipped: true };
  }

  const totalTimeWorkedSeconds = ratings.reduce((sum, row) => sum + row.durationSeconds, 0);

  const sessionPayload: SessionInsert = {
    user_id: user.id,
    date: sessionDate,
    total_time_worked: totalTimeWorkedSeconds,
    sessions_completed: 1,
    blocks_completed: ratings.length,
  };

  const { data: sessionRow, error: sessionInsertError } = await insertSession(sessionPayload);

  if (sessionInsertError || !sessionRow) {
    if (sessionInsertError) {
      alertSessionFinalizeFailure(sessionInsertError.message);
    }
    return { error: sessionInsertError, skipped: false };
  }

  for (const { blockNumber, rating, load, workType, durationSeconds } of ratings) {
    const { error: ratingError } = await upsertBlockRating({
      session_id: sessionRow.id,
      block_number: blockNumber,
      rating,
      load,
      work_type: workType,
      duration_seconds: durationSeconds,
    });

    if (ratingError) {
      alertBlockFailure(ratingError.message);
      return { error: ratingError, skipped: false };
    }
  }

  if (totalTimeWorkedSeconds === 0 && ratings.length > 0) {
    alertHoursFailure("Total focus time was saved as zero. Check work and break length settings.");
  }

  clearLocalBlockKeysForSession(numOfBlocks);

  store.setActiveSupabaseSessionId(null);
  store.bumpChartDataRevision();
  return { error: null, skipped: false };
}
