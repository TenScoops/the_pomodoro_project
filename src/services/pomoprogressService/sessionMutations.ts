import type { PostgrestError } from "@supabase/supabase-js";
import type { BlockRatingInsert, BlockRatingRow, SessionInsert, SessionRow, SessionUpdate } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";

export async function insertSession(
  payload: SessionInsert
): Promise<{ data: SessionRow | null; error: PostgrestError | null }> {
  const response = await supabase.from("sessions").insert(payload).select().single();

  return {
    data: response.data as SessionRow | null,
    error: response.error,
  };
}

/**
 * Inserts or replaces the rating for `(session_id, block_number)` so a repeat tap on the same block
 * updates the row instead of failing on the unique constraint.
 */
export async function upsertBlockRating(
  payload: BlockRatingInsert
): Promise<{ data: BlockRatingRow | null; error: PostgrestError | null }> {
  const response = await supabase
    .from("block_ratings")
    .upsert(payload, { onConflict: "session_id,block_number" })
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
