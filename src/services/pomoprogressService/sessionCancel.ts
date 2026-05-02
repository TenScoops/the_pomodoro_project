import { supabase } from "../../lib/supabaseClient";
import { useSessionStore } from "../../store/sessionStore";
import { findLatestDraftSessionIdForUser } from "./sessionQueries";
import { resolveActiveSessionIdFromStorage } from "./sessionClientHelpers";

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
