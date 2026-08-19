import type { PostgrestError } from "@supabase/supabase-js";
import type { BlockWorkType, SessionInsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import {
  alertBlockFailure,
  alertSessionUpdateFailure,
} from "./alerts";
import { workSecondsForRatedBlock } from "./sessionClientHelpers";
import {
  insertSession,
  syncSessionTotalsFromBlockRatings,
  updateBlockRatingScores,
  upsertBlockRating,
} from "./sessionMutations";

/**
 * Signed-in: on each save, insert `block_ratings` (productivity, load, work type, duration) and update the draft `sessions` row (create draft on
 * first rating). Never sets `sessions_completed` here — completion only in finalize.
 * Guests only use `localStorage` (`Rating` writes keys before this runs).
 */
export async function logBlockRatingForCurrentSession(
  blockNumber: number,
  rating: number,
  load: number
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

  const { error: ratingError } = await upsertBlockRating({
    session_id: sessionId,
    block_number: blockNumber,
    rating,
    load,
    work_type: store.workType,
    duration_seconds: workSecondsForRatedBlock(
      store.workMinutes,
      store.numOfBreaks,
      store.breakMinutes,
      blockNumber
    ),
  });
  if (ratingError) {
    alertBlockFailure(ratingError.message);
    return { error: ratingError };
  }

  const { error: updateError } = await syncSessionTotalsFromBlockRatings(sessionId);
  if (updateError) {
    alertSessionUpdateFailure(updateError.message);
    return { error: updateError };
  }

  store.bumpChartDataRevision();
  return { error: null };
}

/**
 * Signed-in: change productivity, load, and work type on an existing rated block.
 * Duration is left as originally stored. Guests only update `localStorage` in `Rating`.
 */
export async function updateExistingBlockRating(params: {
  sessionId: string;
  blockNumber: number;
  rating: number;
  load: number;
  workType: BlockWorkType;
}): Promise<{ error: PostgrestError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: null };
  }

  const { error } = await updateBlockRatingScores(params.sessionId, params.blockNumber, {
    rating: params.rating,
    load: params.load,
    work_type: params.workType,
  });
  if (error) {
    alertBlockFailure(error.message);
    return { error };
  }

  return { error: null };
}
