import { useEffect } from "react";
import { DEFAULT_DOCUMENT_TITLE, TimerMode } from "../types/timerTypes";

type UseTimerDocumentTitleParams = {
  sessionComplete: boolean;
  safeTimeLeftSeconds: number;
  mode: TimerMode;
  isPaused: boolean;
  totalWorkTimeMinutes: number;
  totalBreakTimeMinutes: number;
  currentWorkBlockIndex: number;
  totalBlocks: number;
};

export default function useTimerDocumentTitle({
  sessionComplete,
  safeTimeLeftSeconds,
  mode,
  isPaused,
  totalWorkTimeMinutes,
  totalBreakTimeMinutes,
  currentWorkBlockIndex,
  totalBlocks,
}: UseTimerDocumentTitleParams) {
  useEffect(() => {
    if (sessionComplete) {
      document.title = DEFAULT_DOCUMENT_TITLE;
      return () => {
        document.title = DEFAULT_DOCUMENT_TITLE;
      };
    }

    const minutesPart = Math.floor(safeTimeLeftSeconds / 60);
    const secondsPart = Math.floor(safeTimeLeftSeconds % 60);
    const timeStr =
      totalWorkTimeMinutes < totalBreakTimeMinutes
        ? "00:00"
        : `${String(minutesPart).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")}`;

    const phaseLabel = mode === "break" ? "Break" : "Work";
    const pauseLabel = isPaused ? " · Paused" : "";
    const blockLabel = mode === "work" ? ` · ${currentWorkBlockIndex}/${totalBlocks}` : "";

    document.title = `${timeStr} · ${phaseLabel}${blockLabel}${pauseLabel} · ${DEFAULT_DOCUMENT_TITLE}`;

    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [
    sessionComplete,
    safeTimeLeftSeconds,
    mode,
    isPaused,
    totalWorkTimeMinutes,
    totalBreakTimeMinutes,
    currentWorkBlockIndex,
    totalBlocks,
  ]);
}

