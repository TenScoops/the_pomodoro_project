import type { PostgrestError } from "@supabase/supabase-js";
import type { SessionInsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import {
  alertBlockFailure,
  alertSessionUpdateFailure,
} from "./alerts";
import { cumulativeWorkSecondsAfterRatedBlocks } from "./sessionClientHelpers";
import { insertSession, updateSession, upsertBlockRating } from "./sessionMutations";

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

  const { error: ratingError } = await upsertBlockRating({
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
