import type { PostgrestError } from "@supabase/supabase-js";
import { parseEnergyLevel, type EnergyLevel } from "../../constants/energyLevels";
import type { EnergyLogUpsert } from "../../types/pomoprogress";
import { supabase } from "../../lib/supabaseClient";
import { isoDatePrefix, parseLocalISODate, todayLocalISODate } from "../../lib/calendarDates";
import { useSessionStore } from "../../store/sessionStore";
import { alertEnergyLogFailure } from "./alerts";

const NOTE_MAX_LENGTH = 500;

export interface EnergyLogRecord {
  id: string;
  date: string;
  energy: EnergyLevel;
  note: string;
}

type EnergyLogRow = {
  id: string;
  date: string;
  energy: number | string;
  note: string;
};

function toRecord(row: EnergyLogRow): EnergyLogRecord | null {
  const energy = parseEnergyLevel(row.energy);
  const date = isoDatePrefix(row.date);
  if (energy == null || !parseLocalISODate(date)) {
    return null;
  }
  return { id: row.id, date, energy, note: row.note ?? "" };
}

function recordsFromRows(data: EnergyLogRow[] | null): EnergyLogRecord[] {
  const records: EnergyLogRecord[] = [];
  for (const row of data ?? []) {
    const record = toRecord(row);
    if (record) {
      records.push(record);
    }
  }
  return records;
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
    return { error: response.error };
  }
  useSessionStore.getState().bumpChartDataRevision();
  return { error: null };
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
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (response.error) {
    return { data: [], error: response.error };
  }

  return { data: recordsFromRows(response.data as EnergyLogRow[] | null), error: null };
}

/** This calendar month’s energy check-ins (inclusive YYYY-MM-DD range). */
export async function getEnergyLogsInRange(
  startDate: string,
  endDate: string
): Promise<{
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
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (response.error) {
    return { data: [], error: response.error };
  }

  return { data: recordsFromRows(response.data as EnergyLogRow[] | null), error: null };
}
