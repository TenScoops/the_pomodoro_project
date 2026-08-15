import React, { useState } from "react";
import { HiOutlineArrowRight, HiOutlineChevronDown, HiPlus } from "react-icons/hi2";
import { useSessionStore } from "../../../store/sessionStore";
import type { SessionWorkType } from "../../sessionSetup/sessionSetupMath";
import AddNoteModal from "./AddNoteModal";
import TimerProgressRing from "./TimerProgressRing";

interface TimerClockProps{
  showClock: boolean;
  minutesLabel: string;
  secondsLabel: string;
  totalWorkTimeMinutes: number;
  totalBreakTimeMinutes: number;
  phaseProgressRatio: number;
};

function formatHeroDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const targetIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden>
    <circle cx="22" cy="26" r="14" strokeWidth="1.6" />
    <circle cx="22" cy="26" r="8.5" strokeWidth="1.6" />
    <circle cx="22" cy="26" r="3.2" strokeWidth="1.6" />
    <path
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M36.5 8.5l-9.2 9.2M36.5 8.5l-4.2 1.1 3.1 3.1 1.1-4.2zM27.3 17.7l-2.4 2.4"
    />
  </svg>
);

export default function TimerClock({
  showClock,
  minutesLabel,
  secondsLabel,
  totalWorkTimeMinutes,
  totalBreakTimeMinutes,
  phaseProgressRatio,
}: TimerClockProps) {
  const workType = useSessionStore((state) => state.workType);
  const setWorkType = useSessionStore((state) => state.setWorkType);
  const focusNote = useSessionStore((state) => state.focusNote);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  if (!showClock) {
    return null;
  }
  const workLessThanBreak = totalWorkTimeMinutes < totalBreakTimeMinutes;
  const displayMinutes = workLessThanBreak ? "00" : minutesLabel;
  const displaySeconds = workLessThanBreak ? "00" : secondsLabel;
  const ringProgress = workLessThanBreak ? 0 : phaseProgressRatio;

  const nextWorkType: SessionWorkType = workType === "Deep Work" ? "Routine" : "Deep Work";
  const isRoutine = workType === "Routine";

  return (
    <div className="timerHero">
      <button type="button" className="timerHero__date">
        <span>{formatHeroDate(new Date())}</span>
        <HiOutlineChevronDown className="timerHero__dateChevron" aria-hidden />
      </button>

      <div className="timerHero__task">
        <div className="timerHero__target">{targetIcon}</div>

        <div className="timerHero__titleRow">
          <div className="timerHero__titleViewport">
            <div
              className={`timerHero__titleTrack${isRoutine ? " timerHero__titleTrack--routine" : ""}`}
            >
              <h2 className="timerHero__title" aria-hidden={isRoutine}>
                Deep Work
              </h2>
              <h2 className="timerHero__title" aria-hidden={!isRoutine}>
                Routine
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="timerHero__workSwitch"
            aria-label={`Switch to ${nextWorkType}`}
            onClick={() => setWorkType(nextWorkType)}
          >
            <HiOutlineArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <TimerProgressRing progressRatio={ringProgress}>
        <p className="timerHero__time" aria-label={`${displayMinutes} minutes ${displaySeconds} seconds`}>
          {displayMinutes}:{displaySeconds}
        </p>
        <p className="timerHero__tagline">Focus on what matters.</p>
        <button className="timerAddNote" type="button" onClick={() => setNoteModalOpen(true)}>
          <HiPlus aria-hidden />
          {focusNote ? "Edit note" : "Add note"}
        </button>
      </TimerProgressRing>

      <AddNoteModal isOpen={noteModalOpen} onRequestClose={() => setNoteModalOpen(false)} />
    </div>
  );
}
