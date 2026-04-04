/**
 * Display seconds vs real seconds. Default is 1 (real-time).
 * Set `REACT_APP_TIMER_SPEED_MULTIPLIER` to a value > 1 in `.env` to speed up the timer for local testing.
 */

function parseTimerSpeedMultiplier(): number {
  const raw = process.env.REACT_APP_TIMER_SPEED_MULTIPLIER;
  if (raw === undefined || raw === "") {
    return 1;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.min(parsed, 3600);
}

/** 1 = real-time; larger = display seconds elapse faster than real seconds. */
export const TIMER_SPEED_MULTIPLIER = parseTimerSpeedMultiplier();

/** In-app toggle next to Start: multiply the base env speed by this factor. */
export const RUNTIME_SPEED_BOOST_MULTIPLIER = 180;

/** How many whole display-seconds are left before `phaseEndAtMs` (UTC ms). */
export function remainingDisplaySeconds(
  phaseEndAtMs: number,
  multiplier: number = TIMER_SPEED_MULTIPLIER
): number {
  return Math.max(0, Math.round(((phaseEndAtMs - Date.now()) * multiplier) / 1000));
}

/** UTC ms when `remaining` display-seconds reach zero at the given speed. */
export function phaseEndFromDisplaySecondsRemaining(
  remaining: number,
  multiplier: number = TIMER_SPEED_MULTIPLIER
): number {
  return Date.now() + (remaining * 1000) / multiplier;
}

/** How often to poll the UI: faster ticks when sped up so seconds update visibly. */
export function timerTickIntervalMs(multiplier: number = TIMER_SPEED_MULTIPLIER): number {
  if (multiplier <= 1) {
    return 1000;
  }
  return Math.max(16, Math.min(250, Math.floor(1000 / multiplier)));
}
