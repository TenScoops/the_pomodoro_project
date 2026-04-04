/**
 * Persists active timer state so a reload can resume the same countdown.
 * Wall-clock `phaseEndAtMs` is the source of truth while the timer is running.
 */

const STORAGE_KEY = "pomoprogress_timer_v1";

export type PersistedTimerV1 = {
  version: 1;
  phaseEndAtMs: number | null;
  timeLeftSeconds: number;
  mode: "work" | "break";
  isPaused: boolean;
  workMinutes: number;
  numOfBreaks: number;
  breakMinutes: number;
  blockNum: number;
  hasUserRated: boolean;
  /** Matches `REACT_APP_TIMER_SPEED_MULTIPLIER` when saved; restore uses this so reload stays consistent if .env changes. */
  speedMultiplier?: number;
};

export function readPersistedTimer(): PersistedTimerV1 | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedTimerV1;
    if (parsed.version !== 1) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedTimer(state: PersistedTimerV1): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function clearPersistedTimer(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
