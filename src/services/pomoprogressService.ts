import type { PostgrestError } from "@supabase/supabase-js";
import type {
  BlockRatingInsert,
  BlockRatingRow,
  SessionInsert,
  SessionRow,
} from "../types/pomoprogress";
import { supabase } from "../lib/supabaseClient";

// --- Helpers ---

/** Inclusive first and last calendar dates (YYYY-MM-DD) for a month (1–12). */
function getMonthDateRange(
  year: number,
  monthOneThroughTwelve: number
): { startDate: string; endDate: string } {
  if (
    monthOneThroughTwelve < 1 ||
    monthOneThroughTwelve > 12 ||
    !Number.isInteger(monthOneThroughTwelve)
  ) {
    throw new Error("month must be an integer from 1 to 12");
  }

  const monthPadded = String(monthOneThroughTwelve).padStart(2, "0");
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = new Date(year, monthOneThroughTwelve, 0);
  const dayPadded = String(lastDay.getDate()).padStart(2, "0");
  const endDate = `${year}-${monthPadded}-${dayPadded}`;

  return { startDate, endDate };
}

// --- API ---

export async function insertSession(
  payload: SessionInsert
): Promise<{ data: SessionRow | null; error: PostgrestError | null }> {
  const response = await supabase
    .from("sessions")
    .insert(payload)
    .select()
    .single();

  return {
    data: response.data as SessionRow | null,
    error: response.error,
  };
}

export async function insertBlockRating(
  payload: BlockRatingInsert
): Promise<{ data: BlockRatingRow | null; error: PostgrestError | null }> {
  const response = await supabase
    .from("block_ratings")
    .insert(payload)
    .select()
    .single();

  return {
    data: response.data as BlockRatingRow | null,
    error: response.error,
  };
}

/**
 * Sessions whose `date` falls in the given calendar month (RLS limits rows to the logged-in user).
 * @param monthOneThroughTwelve January = 1, December = 12
 */
export async function getSessionsByMonth(
  year: number,
  monthOneThroughTwelve: number
): Promise<{ data: SessionRow[]; error: PostgrestError | null }> {
  const { startDate, endDate } = getMonthDateRange(
    year,
    monthOneThroughTwelve
  );

  const response = await supabase
    .from("sessions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    data: (response.data ?? []) as SessionRow[],
    error: response.error,
  };
}

/**
 * Sessions whose `date` falls in the given calendar year.
 */
export async function getSessionsByYear(
  year: number
): Promise<{ data: SessionRow[]; error: PostgrestError | null }> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const response = await supabase
    .from("sessions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return {
    data: (response.data ?? []) as SessionRow[],
    error: response.error,
  };
}
