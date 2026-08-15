import React from "react";

interface TimerProgressRingProps {
  /** 0 = empty ring at the top; 1 = fully filled clockwise. */
  progressRatio: number;
  children: React.ReactNode;
}

const RING_SIZE = 240;
const CENTER = 120;
const RADIUS = 106;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerProgressRing({ progressRatio, children }: TimerProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progressRatio));
  const dashOffset = CIRCUMFERENCE * (1 - clamped);
  // SVG angles start at 3 o'clock; subtract 90° so 0 progress sits at 12 o'clock.
  const knobAngleRadians = (clamped * 360 - 90) * (Math.PI / 180);
  const knobX = CENTER + RADIUS * Math.cos(knobAngleRadians);
  const knobY = CENTER + RADIUS * Math.sin(knobAngleRadians);

  return (
    <div className="timerRing">
      <svg className="timerRing__svg" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden>
        <circle className="timerRing__track" cx={CENTER} cy={CENTER} r={RADIUS} />
        <circle
          className="timerRing__progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
        <circle className="timerRing__knob" cx={knobX} cy={knobY} r="7" />
      </svg>
      <div className="timerRing__content">{children}</div>
    </div>
  );
}
