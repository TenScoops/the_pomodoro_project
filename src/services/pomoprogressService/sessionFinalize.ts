import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { useSessionStore } from "../../store/sessionStore";
import {
  alertHoursFailure,
  alertSessionFinalizeFailure,
  alertSessionTooEarly,
} from "./alerts";
import { clearLocalBlockKeysForSession, resolveActiveSessionIdFromStorage } from "./sessionClientHelpers";
import { persistCompletedPomodoroSessionBulkInsert } from "./sessionFinalizeBulk";
import { findLatestDraftSessionIdForUser } from "./sessionQueries";
import { syncSessionTotalsFromBlockRatings, updateSession } from "./sessionMutations";

/**
 * After the last block is saved: hours come from rated blocks, then mark complete.
 * If no draft id is found (recovery), falls back to `persistCompletedPomodoroSessionBulkInsert`.
 */
export async function finalizeActivePomodoroSession(): Promise<{
  error: PostgrestError | Error | null;
  skipped: boolean;
}> {
  const store = useSessionStore.getState();
  const sessionIdFromStore = store.activeSupabaseSessionId;
  const numOfBlocks = store.numOfBreaks + 1;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError, skipped: true };
  }

  if (!user) {
    clearLocalBlockKeysForSession(numOfBlocks);
    return { error: null, skipped: true };
  }

  let sessionIdToFinalize =
    sessionIdFromStore ?? resolveActiveSessionIdFromStorage() ?? (await findLatestDraftSessionIdForUser(user.id));

  if (sessionIdToFinalize) {
    store.setActiveSupabaseSessionId(sessionIdToFinalize);
  }

  if (!sessionIdToFinalize) {
    return persistCompletedPomodoroSessionBulkInsert();
  }

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

  let totals = await syncSessionTotalsFromBlockRatings(sessionIdToFinalize);
  if (totals.error) {
    const recoveredId = await findLatestDraftSessionIdForUser(user.id);
    if (!recoveredId) {
      alertSessionFinalizeFailure(totals.error.message);
      return { error: totals.error, skipped: false };
    }
    store.setActiveSupabaseSessionId(recoveredId);
    sessionIdToFinalize = recoveredId;
    totals = await syncSessionTotalsFromBlockRatings(recoveredId);
    if (totals.error) {
      alertSessionFinalizeFailure(totals.error.message);
      return { error: totals.error, skipped: false };
    }
  }

  const { error: completeError } = await updateSession(sessionIdToFinalize, { sessions_completed: 1 });
  if (completeError) {
    alertSessionFinalizeFailure(completeError.message);
    return { error: completeError, skipped: false };
  }

  if (totals.totalSeconds === 0 && totals.blockCount > 0) {
    alertHoursFailure("Total focus time was saved as zero. Check work and break length settings.");
  }

  store.setActiveSupabaseSessionId(null);
  clearLocalBlockKeysForSession(numOfBlocks);
  store.bumpChartDataRevision();
  return { error: null, skipped: false };
}
