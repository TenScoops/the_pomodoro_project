/**
 * Matches public.sessions and public.block_ratings in Supabase.
 * total_time_worked is in seconds (see migration comment).
 */

export type SessionRow = {
  id: string;
  user_id: string;
  /** Calendar date of the session (YYYY-MM-DD). */
  date: string;
  total_time_worked: number;
  sessions_completed: number;
  blocks_completed: number;
  created_at: string;
};

export type SessionInsert = {
  user_id: string;
  date: string;
  total_time_worked: number;
  sessions_completed: number;
  blocks_completed: number;
};

export type BlockRatingRow = {
  id: string;
  session_id: string;
  block_number: number;
  rating: number;
  created_at: string;
};

export type BlockRatingInsert = {
  session_id: string;
  block_number: number;
  rating: number;
};
