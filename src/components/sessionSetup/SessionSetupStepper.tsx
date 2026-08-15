import React from "react";
import { HiMinus, HiPlus } from "react-icons/hi2";

type SessionSetupStepperProps = {
  label: string;
  valueText: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
};

export default function SessionSetupStepper({
  label,
  valueText,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: SessionSetupStepperProps) {
  return (
    <div className="sessionSetup__stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="sessionSetup__stepperBtn"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label={`Decrease ${label}`}
      >
        <HiMinus aria-hidden />
      </button>
      <span className="sessionSetup__stepperValue">{valueText}</span>
      <button
        type="button"
        className="sessionSetup__stepperBtn"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label={`Increase ${label}`}
      >
        <HiPlus aria-hidden />
      </button>
    </div>
  );
}
