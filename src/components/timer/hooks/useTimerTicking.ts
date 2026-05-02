import type { MutableRefObject } from "react";
import { useEffect } from "react";
import { remainingDisplaySeconds, timerTickIntervalMs } from "../../../lib/timerSpeed";

type UseTimerTickingParams = {
  isPausedRef: MutableRefObject<boolean>;
  phaseEndAtMsRef: MutableRefObject<number | null>;
  effectiveMultiplierRef: MutableRefObject<number>;
  timeLeftRef: MutableRefObject<number>;
  setTimeLeft: (value: number) => void;
  persistSnapshot: () => void;
  onElapsed: () => void;
  deps: readonly unknown[];
};

export default function useTimerTicking({
  isPausedRef,
  phaseEndAtMsRef,
  effectiveMultiplierRef,
  timeLeftRef,
  setTimeLeft,
  persistSnapshot,
  onElapsed,
  deps,
}: UseTimerTickingParams) {
  useEffect(() => {
    const tick = () => {
      if (isPausedRef.current || phaseEndAtMsRef.current === null) {
        return;
      }
      const remaining = remainingDisplaySeconds(phaseEndAtMsRef.current, effectiveMultiplierRef.current);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      persistSnapshot();
      if (remaining <= 0) {
        onElapsed();
      }
    };

    const intervalId = window.setInterval(tick, timerTickIntervalMs(effectiveMultiplierRef.current));
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (isPausedRef.current || phaseEndAtMsRef.current === null) {
        return;
      }
      const remaining = remainingDisplaySeconds(phaseEndAtMsRef.current, effectiveMultiplierRef.current);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      persistSnapshot();
      if (remaining <= 0) {
        onElapsed();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [effectiveMultiplierRef, isPausedRef, phaseEndAtMsRef, timeLeftRef, persistSnapshot, onElapsed, setTimeLeft]);

  useEffect(() => {
    const onPageHide = () => {
      persistSnapshot();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [persistSnapshot]);
}

