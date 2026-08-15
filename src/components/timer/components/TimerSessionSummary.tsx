import React from "react";
import { HiPencil } from "react-icons/hi2";
import { formatFocusDuration } from "../utils/timerMath";
import "./TimerSessionSummary.css";

interface SessionStatRow {
  label: string;
  value: string;
}

interface TimerSessionSummaryProps {
  plannedFocusMinutes: number;
  completedFocusMinutes: number;
  remainingFocusMinutes: number;
  totalBlocks: number;
  currentWorkBlockIndex: number;
  breakLengthMinutes: number;
  onEdit: () => void;
}

function SessionRows({ rows }: { rows: SessionStatRow[] }) {
  return (
    <dl className="timerSessionCard__rows">
      {rows.map((row) => (
        <div key={row.label} className="timerSessionCard__row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Live snapshot of planned vs done focus time, current block, and break length. */
export default function TimerSessionSummary({
  plannedFocusMinutes,
  completedFocusMinutes,
  remainingFocusMinutes,
  totalBlocks,
  currentWorkBlockIndex,
  breakLengthMinutes,
  onEdit,
}: TimerSessionSummaryProps) {
  const focusRows: SessionStatRow[] = [
    { label: "Planned focus time", value: formatFocusDuration(plannedFocusMinutes) },
    { label: "Completed", value: formatFocusDuration(completedFocusMinutes) },
    { label: "Remaining", value: formatFocusDuration(remainingFocusMinutes) },
  ];

  const extraRows: SessionStatRow[] = [
    { label: "Current block", value: `${currentWorkBlockIndex} of ${totalBlocks}` },
    { label: "Break length", value: `${breakLengthMinutes} min` },
  ];

  return (
    <aside className="timerSessionCard" aria-label="Session">
      <header className="timerSessionCard__header">
        <h2 className="timerSessionCard__title">Session</h2>
        <button type="button" className="timerSessionCard__edit" onClick={onEdit}>
          <HiPencil aria-hidden />
          Edit
        </button>
      </header>

      <SessionRows rows={focusRows} />
      <hr className="timerSessionCard__divider" />
      <SessionRows rows={extraRows} />
    </aside>
  );
}
