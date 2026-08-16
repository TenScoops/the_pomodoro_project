import type { PostgrestError } from "@supabase/supabase-js";
import type { EnergyLevel } from "../../constants/energyLevels";
import type { EnergyLogUpsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { todayLocalISODate } from "../../lib/calendarDates";
import { alertEnergyLogFailure } from "./alerts";

const NOTE_MAX_LENGTH = 500;

export interface EnergyLogRecord {
  id: string;
  date: string;
  energy: EnergyLevel;
  note: string;
}

function isEnergyLevel(value: number): value is EnergyLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function toRecord(row: { id: string; date: string; energy: number; note: string }): EnergyLogRecord | null {
  if (!isEnergyLevel(row.energy)) {
    return null;
  }
  return { id: row.id, date: row.date, energy: row.energy, note: row.note ?? "" };
}

/**
 * Signed-in: upsert today's energy. Guests: error so the UI can revert.
 */
export async function persistEnergyLogForToday(
  energy: EnergyLevel,
  note: string
): Promise<{ error: PostgrestError | Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const guestError = new Error("Sign in to save your energy.");
    alertEnergyLogFailure(guestError.message);
    return { error: guestError };
  }

  const payload: EnergyLogUpsert = {
    user_id: user.id,
    date: todayLocalISODate(),
    energy,
    note: note.trim().slice(0, NOTE_MAX_LENGTH),
    updated_at: new Date().toISOString(),
  };

  const response = await supabase.from("energy_logs").upsert(payload, { onConflict: "user_id,date" });
  if (response.error) {
    alertEnergyLogFailure(response.error.message);
  }
  return { error: response.error };
}

export async function getEnergyLogs(): Promise<{
  data: EnergyLogRecord[];
  error: PostgrestError | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: null };
  }

  const response = await supabase
    .from("energy_logs")
    .select("id, date, energy, note")
    .order("date", { ascending: false });

  if (response.error) {
    return { data: [], error: response.error };
  }

  const rows = (response.data ?? []) as { id: string; date: string; energy: number; note: string }[];
  const data: EnergyLogRecord[] = [];
  for (const row of rows) {
    const record = toRecord(row);
    if (record) {
      data.push(record);
    }
  }
  return { data, error: null };
}
