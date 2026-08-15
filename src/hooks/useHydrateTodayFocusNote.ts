import { useEffect } from "react";
import { todayLocalISODate } from "../lib/calendarDates";
import { getDailyNoteForDate } from "../services/pomoprogressService";
import { currentFocusNoteHydrateGeneration } from "../services/pomoprogressService/dailyNotes";
import { useSessionStore } from "../store/sessionStore";
import { useAuth } from "./useAuth";

/**
 * Loads today's saved note into the session store when a signed-in user opens Focus.
 */
export function useHydrateTodayFocusNote(): void {
  const { user, loading } = useAuth();
  const setFocusNote = useSessionStore((state) => state.setFocusNote);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      return;
    }

    let cancelled = false;
    const generation = currentFocusNoteHydrateGeneration();

    void (async () => {
      const { note, error } = await getDailyNoteForDate(todayLocalISODate());
      if (cancelled || error || generation !== currentFocusNoteHydrateGeneration()) {
        return;
      }
      setFocusNote(note ?? "");
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, setFocusNote]);
}
