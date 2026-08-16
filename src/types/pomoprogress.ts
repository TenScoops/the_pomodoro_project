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

/** Partial update for `sessions` (e.g. finalize totals after blocks were logged incrementally). */
export type SessionUpdate = {
  total_time_worked?: number;
  sessions_completed?: number;
  blocks_completed?: number;
};

/** Matches `block_ratings.work_type`. */
export type BlockWorkType = "Deep Work" | "Routine";

export type BlockRatingRow = {
  id: string;
  session_id: string;
  block_number: number;
  /** Productivity 1–10 in 0.25 steps. */
  rating: number;
  /** Load / difficulty 1–5 in 0.25 steps; null on rows saved before load was recorded. */
  load: number | null;
  /** Null on rows saved before work type was recorded. */
  work_type: BlockWorkType | null;
  /** Focus seconds for this block; null on rows saved before duration was recorded. */
  duration_seconds: number | null;
  created_at: string;
};

export type BlockRatingInsert = {
  session_id: string;
  block_number: number;
  rating: number;
  load?: number | null;
  work_type?: BlockWorkType | null;
  duration_seconds?: number | null;
};

/** Nested row returned by Supabase when selecting `block_ratings (...)` on sessions. */
export type BlockRatingNested = {
  block_number: number;
  rating: number;
  load: number | null;
  work_type: BlockWorkType | null;
  duration_seconds: number | null;
};

export type SessionWithRatings = SessionRow & {
  block_ratings: BlockRatingNested[] | null;
};

/** Matches public.daily_notes — one focus note per user per calendar day. */
export type DailyNoteRow = {
  id: string;
  user_id: string;
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type DailyNoteUpsert = {
  user_id: string;
  date: string;
  note: string;
  updated_at: string;
};

export type EnergyLevelScore = 1 | 2 | 3 | 4 | 5;

/** Matches public.energy_logs — one energy check-in per user per calendar day. */
export interface EnergyLogRow {
  id: string;
  user_id: string;
  date: string;
  energy: EnergyLevelScore;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface EnergyLogUpsert {
  user_id: string;
  date: string;
  energy: EnergyLevelScore;
  note: string;
  updated_at: string;
}
