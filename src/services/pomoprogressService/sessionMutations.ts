import type { PostgrestError } from "@supabase/supabase-js";
import type {
  BlockRatingInsert,
  BlockRatingRow,
  BlockWorkType,
  SessionInsert,
  SessionRow,
  SessionUpdate,
} from "../../types/pomoprogress";
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

/** Updates scores only so duration_seconds from the original rating stays in place. */
export async function updateBlockRatingScores(
  sessionId: string,
  blockNumber: number,
  patch: { rating: number; load: number; work_type: BlockWorkType }
): Promise<{ error: PostgrestError | null }> {
  const response = await supabase
    .from("block_ratings")
    .update(patch)
    .eq("session_id", sessionId)
    .eq("block_number", blockNumber)
    .select("id")
    .maybeSingle();

  if (response.error) {
    return { error: response.error };
  }
  if (!response.data) {
    return {
      error: {
        name: "PostgrestError",
        message: "Block rating update matched no row (wrong session, block number, or RLS).",
        details: "",
        hint: "",
        code: "PGRST116",
      } as PostgrestError,
    };
  }
  return { error: null };
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

/** Hours and block count come only from saved ratings. */
export async function syncSessionTotalsFromBlockRatings(
  sessionId: string
): Promise<{ error: PostgrestError | null; totalSeconds: number; blockCount: number }> {
  const response = await supabase
    .from("block_ratings")
    .select("duration_seconds")
    .eq("session_id", sessionId);

  if (response.error) {
    return { error: response.error, totalSeconds: 0, blockCount: 0 };
  }

  const rows = (response.data ?? []) as { duration_seconds: number | null }[];
  const totalSeconds = rows.reduce((sum, row) => sum + (row.duration_seconds ?? 0), 0);
  const { error } = await updateSession(sessionId, {
    total_time_worked: totalSeconds,
    blocks_completed: rows.length,
  });

  return { error, totalSeconds, blockCount: rows.length };
}
