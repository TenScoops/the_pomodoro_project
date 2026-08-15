import React from "react";

const DEFAULT_STEP = 0.25;

type RatingScaleSliderProps = {
  titleId: string;
  title: string;
  hint: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (nextValue: number) => void;
  lowLabel: string;
  highLabel: string;
};

function snapToStep(value: number, min: number, max: number, step: number): number {
  const stepsFromMin = Math.round((value - min) / step);
  const snapped = min + stepsFromMin * step;
  const clamped = Math.min(max, Math.max(min, snapped));
  return Number(clamped.toFixed(2));
}

function formatScaleValue(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function fillPercent(value: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return ((value - min) / (max - min)) * 100;
}

const RatingScaleSlider = ({
  titleId,
  title,
  hint,
  min,
  max,
  step = DEFAULT_STEP,
  value,
  onChange,
  lowLabel,
  highLabel,
}: RatingScaleSliderProps) => {
  const percent = fillPercent(value, min, max);

  const commitFromEvent = (event: React.ChangeEvent<HTMLInputElement> | React.PointerEvent<HTMLInputElement>) => {
    onChange(snapToStep(Number(event.currentTarget.value), min, max, step));
  };

  return (
    <section className="rateSession__scale" aria-labelledby={titleId}>
      <div className="rateSession__scaleHeading">
        <h3 className="rateSession__scaleTitle" id={titleId}>
          {title}
        </h3>
        <span className="rateSession__scaleValue rateSession__scaleValue--set" aria-live="polite">
          {formatScaleValue(value)}
        </span>
      </div>
      <p className="rateSession__scaleHint">{hint}</p>
      <input
        type="range"
        className="rateSession__slider"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={titleId}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{ "--slider-fill": `${percent}%` } as React.CSSProperties}
        onChange={commitFromEvent}
        onPointerUp={commitFromEvent}
      />
      <div className="rateSession__scaleEnds">
        <span>
          {formatScaleValue(min)} · {lowLabel}
        </span>
        <span>
          {highLabel} · {formatScaleValue(max)}
        </span>
      </div>
    </section>
  );
};

export default RatingScaleSlider;
