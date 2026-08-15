import React from "react";
import {
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineSquare2Stack,
} from "react-icons/hi2";
import { MdOutlineCoffee } from "react-icons/md";
import SessionSetupStepper from "./SessionSetupStepper";
import {
  FOCUS_STEP_MINUTES,
  MAX_BLOCKS,
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BLOCKS,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
  clampSetupValue,
  formatStepperDuration,
  minutesPerFocusBlock,
  type SessionSetupDraft,
  type SessionWorkType,
} from "./sessionSetupMath";

type SessionSetupFieldsProps = {
  draft: SessionSetupDraft;
  onChange: (next: SessionSetupDraft) => void;
};

type SetupStepLayoutProps = {
  stepNumber: number;
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
};

function SetupStepLayout({ stepNumber, icon, title, hint, children }: SetupStepLayoutProps) {
  return (
    <section className="sessionSetup__step">
      <div className="sessionSetup__stepCopy">
        <div className="sessionSetup__stepIcon" aria-hidden>
          {icon}
        </div>
        <div>
          <h3 className="sessionSetup__stepTitle">
            {stepNumber}. {title}
          </h3>
          <p className="sessionSetup__stepHint">{hint}</p>
        </div>
      </div>
      <div className="sessionSetup__stepControl">{children}</div>
    </section>
  );
}

export default function SessionSetupFields({ draft, onChange }: SessionSetupFieldsProps) {
  const blockMinutes = minutesPerFocusBlock(draft.focusMinutes, draft.totalBlocks);
  const blockMinutesLabel = Number.isInteger(blockMinutes)
    ? String(blockMinutes)
    : blockMinutes.toFixed(1);

  const setFocusMinutes = (nextMinutes: number) => {
    onChange({
      ...draft,
      focusMinutes: clampSetupValue(nextMinutes, MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES),
    });
  };

  const setTotalBlocks = (nextBlocks: number) => {
    onChange({
      ...draft,
      totalBlocks: clampSetupValue(nextBlocks, MIN_BLOCKS, MAX_BLOCKS),
    });
  };

  const setBreakMinutes = (nextMinutes: number) => {
    onChange({
      ...draft,
      breakMinutes: clampSetupValue(nextMinutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES),
    });
  };

  const setWorkType = (workType: SessionWorkType) => {
    onChange({ ...draft, workType });
  };

  return (
    <div className="sessionSetup__fields">
      <SetupStepLayout
        stepNumber={1}
        icon={<HiOutlineClock />}
        title="How long do you want to work?"
        hint="Total focus time (not including breaks)"
      >
        <SessionSetupStepper
          label="Work duration"
          valueText={formatStepperDuration(draft.focusMinutes)}
          onDecrease={() => setFocusMinutes(draft.focusMinutes - FOCUS_STEP_MINUTES)}
          onIncrease={() => setFocusMinutes(draft.focusMinutes + FOCUS_STEP_MINUTES)}
          decreaseDisabled={draft.focusMinutes <= MIN_FOCUS_MINUTES}
          increaseDisabled={draft.focusMinutes >= MAX_FOCUS_MINUTES}
        />
        <p className="sessionSetup__stepMeta">{draft.focusMinutes} minutes</p>
      </SetupStepLayout>

      <SetupStepLayout
        stepNumber={2}
        icon={<HiOutlineSquare2Stack />}
        title="How many blocks (pomodoros)?"
        hint="Number of focus blocks"
      >
        <SessionSetupStepper
          label="Focus blocks"
          valueText={`${draft.totalBlocks} ${draft.totalBlocks === 1 ? "block" : "blocks"}`}
          onDecrease={() => setTotalBlocks(draft.totalBlocks - 1)}
          onIncrease={() => setTotalBlocks(draft.totalBlocks + 1)}
          decreaseDisabled={draft.totalBlocks <= MIN_BLOCKS}
          increaseDisabled={draft.totalBlocks >= MAX_BLOCKS}
        />
        <p className="sessionSetup__stepMeta">Each block will be {blockMinutesLabel} min</p>
      </SetupStepLayout>

      <SetupStepLayout
        stepNumber={3}
        icon={<MdOutlineCoffee />}
        title="Break length after each block?"
        hint="Time for a short break"
      >
        <SessionSetupStepper
          label="Break length"
          valueText={`${draft.breakMinutes} min`}
          onDecrease={() => setBreakMinutes(draft.breakMinutes - 1)}
          onIncrease={() => setBreakMinutes(draft.breakMinutes + 1)}
          decreaseDisabled={draft.breakMinutes <= MIN_BREAK_MINUTES}
          increaseDisabled={draft.breakMinutes >= MAX_BREAK_MINUTES}
        />
      </SetupStepLayout>

      <SetupStepLayout
        stepNumber={4}
        icon={<HiOutlineBriefcase />}
        title="What type of work is this?"
        hint="Helps track and analyze your sessions"
      >
        <div className="sessionSetup__workTypes" role="radiogroup" aria-label="Work type">
          <button
            type="button"
            role="radio"
            aria-checked={draft.workType === "Deep Work"}
            className={`sessionSetup__workCard${draft.workType === "Deep Work" ? " sessionSetup__workCard--selected" : ""}`}
            onClick={() => setWorkType("Deep Work")}
          >
            <span className="sessionSetup__workCardTitle">Deep Work</span>
            <span className="sessionSetup__workCardHint">Cognitively demanding.</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={draft.workType === "Routine"}
            className={`sessionSetup__workCard${draft.workType === "Routine" ? " sessionSetup__workCard--selected" : ""}`}
            onClick={() => setWorkType("Routine")}
          >
            <span className="sessionSetup__workCardTitle">Routine</span>
            <span className="sessionSetup__workCardHint">Shallow, routine tasks.</span>
          </button>
        </div>
      </SetupStepLayout>
    </div>
  );
}
