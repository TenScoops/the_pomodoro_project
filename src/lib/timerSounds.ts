/**
 * Short phase-complete cues via Web Audio (no sound files; works after a user gesture unlocks audio).
 */

type Phase = "work" | "break";

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

/** One complete beep; second beep is scheduled only after this duration (no overlap). */
const BEEP_DURATION_SEC = 0.055;
/** Quiet gap after the first beep finishes, before the second beep starts. */
const GAP_BETWEEN_BEEPS_SEC = 0.18;
const BEEP_ATTACK_SEC = 0.004;

function scheduleBeep(
  context: AudioContext,
  startAt: number,
  frequencyHz: number,
  peakGain: number
): void {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencyHz, startAt);
  const endAt = startAt + BEEP_DURATION_SEC;
  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(peakGain, startAt + BEEP_ATTACK_SEC);
  gainNode.gain.linearRampToValueAtTime(0, endAt);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.002);
}

/**
 * Plays when a timer phase hits zero during normal use (not when restoring stale state).
 * Both phases use two beeps; work uses higher pitches, break slightly lower and softer.
 */
export function playTimerPhaseCompleteSound(phaseThatEnded: Phase): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const run = (): void => {
    const now = context.currentTime;
    const secondBeepStart =
      now + BEEP_DURATION_SEC + GAP_BETWEEN_BEEPS_SEC;
    if (phaseThatEnded === "work") {
      scheduleBeep(context, now, 880, 0.22);
      scheduleBeep(context, secondBeepStart, 1108, 0.2);
    } else {
      scheduleBeep(context, now, 659, 0.17);
      scheduleBeep(context, secondBeepStart, 784, 0.16);
    }
  };

  if (context.state === "suspended") {
    void context.resume().then(run).catch(() => {
      /* autoplay policy — ignore */
    });
  } else {
    run();
  }
}
