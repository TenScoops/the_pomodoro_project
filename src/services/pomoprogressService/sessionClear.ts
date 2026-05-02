import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import { clearGuestBlockRatingLocalStorage } from "./sessionClientHelpers";

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
