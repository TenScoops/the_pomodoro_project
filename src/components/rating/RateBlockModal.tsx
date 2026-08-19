import React, { useEffect, useRef, useState } from "react";
import Modal, { type Styles } from "react-modal";
import { HiCheck, HiChevronDown, HiOutlineClock } from "react-icons/hi2";
import type { SessionWorkType } from "../sessionSetup/sessionSetupMath";
import RatingScaleSlider from "./RatingScaleSlider";
import "./Rating.css";

const modalStyles: Styles = {
  overlay: {
    backgroundColor: "rgba(8, 8, 11, 0.82)",
    zIndex: 10000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    padding: 0,
    maxHeight: "90vh",
    width: "min(520px, calc(100vw - 32px))",
    overflow: "hidden",
    outline: "none",
    zIndex: 10001,
  },
};

const WORK_TYPES: SessionWorkType[] = ["Deep Work", "Routine"];

interface RateBlockModalProps {
  isOpen: boolean;
  idPrefix: string;
  blockMetaLabel: string;
  workType: SessionWorkType;
  onWorkTypeChange: (workType: SessionWorkType) => void;
  productivity: number;
  onProductivityChange: (value: number) => void;
  load: number;
  onLoadChange: (value: number) => void;
  submitLabel: string;
  onSubmit: () => void;
  allowDismiss: boolean;
  onDismiss?: () => void;
}

export function formatBlockMinutes(minutes: number): string {
  const rounded = Number.isInteger(minutes) ? minutes : Math.round(minutes * 10) / 10;
  return `${rounded} min`;
}

export default function RateBlockModal({
  isOpen,
  idPrefix,
  blockMetaLabel,
  workType,
  onWorkTypeChange,
  productivity,
  onProductivityChange,
  load,
  onLoadChange,
  submitLabel,
  onSubmit,
  allowDismiss,
  onDismiss,
}: RateBlockModalProps) {
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const workTypeWrapRef = useRef<HTMLDivElement | null>(null);
  const workTypeLabelId = `${idPrefix}-work-type-label`;

  useEffect(() => {
    const bodyClass = "rate-session-open";
    if (isOpen) {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => document.body.classList.remove(bodyClass);
  }, [isOpen]);

  useEffect(() => {
    if (!workTypeOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!workTypeWrapRef.current?.contains(event.target as Node)) {
        setWorkTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [workTypeOpen]);

  return (
    <Modal
      isOpen={isOpen}
      style={modalStyles}
      contentLabel="Rate your session"
      shouldCloseOnOverlayClick={allowDismiss}
      shouldCloseOnEsc={allowDismiss}
      onRequestClose={allowDismiss ? onDismiss : undefined}
    >
      <div className="rateSession">
        <header className="rateSession__header">
          <div>
            <h2 className="rateSession__title">How was this block?</h2>
            <p className="rateSession__subtitle">Your feedback helps you understand your patterns and improve.</p>
          </div>
        </header>

        <div className="rateSession__body">
          <div className="rateSession__topRow">
            <div className="rateSession__field">
              <span className="rateSession__label rateSession__label--spacer" aria-hidden>
                Work type
              </span>
              <p className="rateSession__meta">
                <HiOutlineClock aria-hidden />
                {blockMetaLabel}
              </p>
            </div>

            <div className="rateSession__field">
              <span className="rateSession__label" id={workTypeLabelId}>
                Work type
              </span>
              <div className="rateSession__dropdownWrap" ref={workTypeWrapRef}>
                <button
                  type="button"
                  className="rateSession__dropdown"
                  aria-labelledby={workTypeLabelId}
                  aria-haspopup="listbox"
                  aria-expanded={workTypeOpen}
                  onClick={() => setWorkTypeOpen((open) => !open)}
                >
                  <span
                    className={`rateSession__typeDot rateSession__typeDot--${workType === "Deep Work" ? "deep" : "routine"}`}
                    aria-hidden
                  />
                  {workType}
                  <HiChevronDown
                    className={`rateSession__chevron${workTypeOpen ? " rateSession__chevron--open" : ""}`}
                    aria-hidden
                  />
                </button>
                {workTypeOpen ? (
                  <ul className="rateSession__menu" role="listbox" aria-labelledby={workTypeLabelId}>
                    {WORK_TYPES.map((type) => {
                      const selected = type === workType;
                      return (
                        <li key={type} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`rateSession__menuItem${selected ? " rateSession__menuItem--selected" : ""}`}
                            onClick={() => {
                              onWorkTypeChange(type);
                              setWorkTypeOpen(false);
                            }}
                          >
                            <span
                              className={`rateSession__typeDot rateSession__typeDot--${type === "Deep Work" ? "deep" : "routine"}`}
                              aria-hidden
                            />
                            {type}
                            {selected ? <HiCheck className="rateSession__check" aria-hidden /> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>

          <RatingScaleSlider
            titleId={`${idPrefix}-productivity-title`}
            title="1. Productivity (1-10)"
            hint="How productive was this block?"
            min={1}
            max={10}
            step={0.25}
            value={productivity}
            onChange={onProductivityChange}
            lowLabel="Low"
            highLabel="Excellent"
          />

          <RatingScaleSlider
            titleId={`${idPrefix}-load-title`}
            title="2. Load / Difficulty (1-5)"
            hint="How mentally demanding or taxing was this block?"
            min={1}
            max={5}
            step={0.25}
            value={load}
            onChange={onLoadChange}
            lowLabel="Very light"
            highLabel="Very heavy"
          />
        </div>

        <footer className="rateSession__footer">
          <button type="button" className="rateSession__save" onClick={onSubmit}>
            {submitLabel}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
