import type { PostgrestError } from "@supabase/supabase-js";
import type { SessionWithRatings } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";

/**
 * Draft `sessions` row for today (`sessions_completed = 0`) — in-progress run. Used by finalize/cancel
 * if `activeSupabaseSessionId` was lost from memory, and to clean up on cancel.
 */
export async function findLatestDraftSessionIdForUser(userId: string): Promise<string | null> {
  const today = todayLocalISODate();
  const response = await supabase
    .from("sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("date", today)
    .eq("sessions_completed", 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = response.data as { id: string } | null;
  return row?.id ?? null;
}

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

export const sessionSelectWithRatings = `
  id,
  user_id,
  date,
  total_time_worked,
  sessions_completed,
  blocks_completed,
  created_at,
  block_ratings ( block_number, rating )
`;

/**
 * Sessions in a calendar month with per-block ratings (RLS limits to the signed-in user).
 */
export async function getSessionsWithRatingsForMonth(
  year: number,
  monthOneThroughTwelve: number
): Promise<{ data: SessionWithRatings[]; error: PostgrestError | null }> {
  const { startDate, endDate } = getMonthDateRange(year, monthOneThroughTwelve);

  const response = await supabase
    .from("sessions")
    .select(sessionSelectWithRatings)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as SessionWithRatings[],
    error: response.error,
  };
}

/**
 * Sessions in a calendar year with per-block ratings.
 */
export async function getSessionsWithRatingsForYear(
  year: number
): Promise<{ data: SessionWithRatings[]; error: PostgrestError | null }> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const response = await supabase
    .from("sessions")
    .select(sessionSelectWithRatings)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as SessionWithRatings[],
    error: response.error,
  };
}

/** Sessions for one specific local calendar date (YYYY-MM-DD). */
export async function getSessionsWithRatingsForDate(
  date: string
): Promise<{ data: SessionWithRatings[]; error: PostgrestError | null }> {
  const response = await supabase
    .from("sessions")
    .select(sessionSelectWithRatings)
    .eq("date", date)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as SessionWithRatings[],
    error: response.error,
  };
}

/** Latest calendar date before `beforeDate` where the signed-in user has at least one rated block. */
export async function getLatestRatedSessionDateBefore(beforeDate: string): Promise<{
  date: string | null;
  error: PostgrestError | null;
}> {
  const response = await supabase
    .from("sessions")
    .select("date")
    .gt("blocks_completed", 0)
    .lt("date", beforeDate)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = response.data as { date: string } | null;
  return {
    date: row?.date ?? null,
    error: response.error,
  };
}
