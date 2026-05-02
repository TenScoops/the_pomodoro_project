import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionStore } from "../../../store/sessionStore";
import { TimerMode } from "../types/timerTypes";

export default function useBlockCompleteToast(mode: TimerMode) {
  const previousModeRef = useRef<TimerMode>(mode);
  const [showBlockCompleteToast, setShowBlockCompleteToast] = useState(false);
  const [toastBlockNumber, setToastBlockNumber] = useState(1);

  useEffect(() => {
    const previousMode = previousModeRef.current;
    previousModeRef.current = mode;

    if (previousMode === "work" && mode === "break") {
      setToastBlockNumber(useSessionStore.getState().blockNum);
      setShowBlockCompleteToast(true);
    }
  }, [mode]);

  const dismissBlockCompleteToast = useCallback(() => {
    setShowBlockCompleteToast(false);
  }, []);

  return { showBlockCompleteToast, toastBlockNumber, dismissBlockCompleteToast };
}

