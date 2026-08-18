import type { AnalysisEnergyLog, AnalysisFocusNote } from "../src/lib/aiAnalysisDaySummary";
import type { SessionWithRatings } from "../src/types/pomoprogress";
import type { SupabaseClient } from "@supabase/supabase-js";

const SESSION_SELECT_WITH_RATINGS = `
  id,
  user_id,
  date,
  total_time_worked,
  sessions_completed,
  blocks_completed,
  created_at,
  block_ratings ( block_number, rating, load, work_type, duration_seconds )
`;

export interface ProductivityBundle {
  sessions: SessionWithRatings[];
  energyLogs: AnalysisEnergyLog[];
  focusNotes: AnalysisFocusNote[];
}

function isHalfStepEnergy(value: number): boolean {
  return value >= 1 && value <= 5 && value * 2 === Math.round(value * 2);
}

export async function fetchProductivityBundle(
  client: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<ProductivityBundle> {
  const [sessionsResponse, energyResponse, notesResponse] = await Promise.all([
    client
      .from("sessions")
      .select(SESSION_SELECT_WITH_RATINGS)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true }),
    client
      .from("energy_logs")
      .select("date, energy, note")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true }),
    client
      .from("daily_notes")
      .select("date, note")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true }),
  ]);

  if (sessionsResponse.error) {
    throw new Error(sessionsResponse.error.message);
  }
  if (energyResponse.error) {
    throw new Error(energyResponse.error.message);
  }
  if (notesResponse.error) {
    throw new Error(notesResponse.error.message);
  }

  const energyRows = (energyResponse.data ?? []) as Array<{
    date: string;
    energy: number | string;
    note: string;
  }>;
  const energyLogs: AnalysisEnergyLog[] = [];
  for (const row of energyRows) {
    const energy = typeof row.energy === "string" ? Number(row.energy) : row.energy;
    if (isHalfStepEnergy(energy)) {
      energyLogs.push({ date: row.date, energy, note: row.note ?? "" });
    }
  }

  return {
    sessions: (sessionsResponse.data ?? []) as SessionWithRatings[],
    energyLogs,
    focusNotes: (notesResponse.data ?? []) as AnalysisFocusNote[],
  };
}
