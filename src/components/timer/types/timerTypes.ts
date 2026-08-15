export type TimerMode = "work" | "break";

/** Matches `public/index.html` — restored when the timer unmounts or the session ends. */
export const DEFAULT_DOCUMENT_TITLE = "The Progress Pomodoro";

export type UsePomodoroTimerResult = {
  isPaused: boolean;
  mode: TimerMode;
  minutes: number;
  seconds: number;
  /** How much of the current work/break block has elapsed (0 empty ring, 1 full). */
  phaseProgressRatio: number;
  totalBreakTimeMinutes: number;
  totalWorkTimeMinutes: number;
  totalBlocks: number;
  currentWorkBlockIndex: number;
  effectiveMultiplier: number;
  speedBoostEnabled: boolean;
  speedBoostTitle: string;
  speedBoostLabel: string;
  showBlockCompleteToast: boolean;
  toastBlockNumber: number;
  dismissBlockCompleteToast: () => void;
  pauseFromClock: () => void;
  resumeTimer: () => void;
  toggleSpeedBoost: () => void;
  skipBreak: () => void;
};

