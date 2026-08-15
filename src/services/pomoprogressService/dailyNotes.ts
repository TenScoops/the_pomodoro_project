import type { PostgrestError } from "@supabase/supabase-js";
import type { DailyNoteUpsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { alertNoteFailure } from "./alerts";

/** Bumped when a note is written so an in-flight hydrate cannot overwrite it. */
let focusNoteHydrateGeneration = 0;

export function bumpFocusNoteHydrateGeneration(): void {
  focusNoteHydrateGeneration += 1;
}

export function currentFocusNoteHydrateGeneration(): number {
  return focusNoteHydrateGeneration;
}

export type DailyNoteDateRow = {
  date: string;
  note: string;
};

/**
 * Signed-in: upsert today's note, or delete the row when the text is empty.
 * Guests: no-op (caller still keeps the note in memory).
 */
export async function persistFocusNoteForToday(note: string): Promise<{ error: PostgrestError | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: null };
  }

  bumpFocusNoteHydrateGeneration();

  const today = todayLocalISODate();
  const trimmed = note.trim();

  if (trimmed.length === 0) {
    const response = await supabase.from("daily_notes").delete().eq("user_id", user.id).eq("date", today);
    bumpFocusNoteHydrateGeneration();
    if (response.error) {
      alertNoteFailure(response.error.message);
    }
    return { error: response.error };
  }

  const payload: DailyNoteUpsert = {
    user_id: user.id,
    date: today,
    note: trimmed,
    updated_at: new Date().toISOString(),
  };

  const response = await supabase.from("daily_notes").upsert(payload, { onConflict: "user_id,date" });
  bumpFocusNoteHydrateGeneration();
  if (response.error) {
    alertNoteFailure(response.error.message);
  }
  return { error: response.error };
}

export async function getDailyNoteForDate(date: string): Promise<{
  note: string | null;
  error: PostgrestError | null;
}> {
  const response = await supabase.from("daily_notes").select("note").eq("date", date).maybeSingle();
  const row = response.data as { note: string } | null;
  return {
    note: row?.note ?? null,
    error: response.error,
  };
}

export async function getDailyNotesInRange(
  startDate: string,
  endDate: string
): Promise<{ data: DailyNoteDateRow[]; error: PostgrestError | null }> {
  const response = await supabase
    .from("daily_notes")
    .select("date, note")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return {
    data: (response.data ?? []) as DailyNoteDateRow[],
    error: response.error,
  };
}
