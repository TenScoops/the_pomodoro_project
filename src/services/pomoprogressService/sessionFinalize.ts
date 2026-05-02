import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { useSessionStore } from "../../store/sessionStore";
import {
  alertHoursFailure,
  alertSessionFinalizeFailure,
  alertSessionTooEarly,
} from "./alerts";
import { resolveActiveSessionIdFromStorage } from "./sessionClientHelpers";
import { persistCompletedPomodoroSessionBulkInsert } from "./sessionFinalizeBulk";
import { findLatestDraftSessionIdForUser } from "./sessionQueries";
import { updateSession } from "./sessionMutations";

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
