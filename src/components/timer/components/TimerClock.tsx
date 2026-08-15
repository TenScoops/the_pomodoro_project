import React from "react";
import { HiOutlineChevronDown, HiOutlinePencil, HiPlus } from "react-icons/hi2";
import TimerProgressRing from "./TimerProgressRing";

type TimerClockProps = {
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
  if (!showClock) {
    return null;
  }

  const workLessThanBreak = totalWorkTimeMinutes < totalBreakTimeMinutes;
  const displayMinutes = workLessThanBreak ? "00" : minutesLabel;
  const displaySeconds = workLessThanBreak ? "00" : secondsLabel;
  const ringProgress = workLessThanBreak ? 0 : phaseProgressRatio;

  return (
    <div className="timerHero">
      <button type="button" className="timerHero__date">
        <span>{formatHeroDate(new Date())}</span>
        <HiOutlineChevronDown className="timerHero__dateChevron" aria-hidden />
      </button>

      <div className="timerHero__task">
        <div className="timerHero__target">{targetIcon}</div>

        <div className="timerHero__titleRow">
          <h2 className="timerHero__title">Deep Work</h2>
          <button type="button" className="timerHero__edit" aria-label="Edit task">
            <HiOutlinePencil aria-hidden />
          </button>
        </div>
      </div>

      <TimerProgressRing progressRatio={ringProgress}>
        <p className="timerHero__time" aria-label={`${displayMinutes} minutes ${displaySeconds} seconds`}>
          {displayMinutes}:{displaySeconds}
        </p>
        <p className="timerHero__tagline">Focus on what matters.</p>
        <button className="timerAddNote" type="button">
          <HiPlus aria-hidden />
          Add note
        </button>
      </TimerProgressRing>
    </div>
  );
}
