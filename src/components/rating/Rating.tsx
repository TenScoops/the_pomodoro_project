import React, { useEffect, useRef, useState } from "react";
import Modal, { type Styles } from "react-modal";
import { HiCheck, HiChevronDown, HiOutlineClock } from "react-icons/hi2";
import PerformanceRatedToast from "../notifications/PerformanceRatedToast";
import RatingScaleSlider from "./RatingScaleSlider";
import "./Rating.css";
import { finalizeActivePomodoroSession, logBlockRatingForCurrentSession } from "../../services/pomoprogressService";
import { localBlockLoadKey, localBlockWorkTypeKey } from "../../services/pomoprogressService/sessionClientHelpers";
import { useSessionStore } from "../../store/sessionStore";
import { minutesPerFocusBlock, type SessionWorkType } from "../sessionSetup/sessionSetupMath";

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

function formatBlockMinutes(minutes: number): string {
  const rounded = Number.isInteger(minutes) ? minutes : Math.round(minutes * 10) / 10;
  return `${rounded} min`;
}

const Rating = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [showRatedToast, setShowRatedToast] = useState(false);
  const [productivity, setProductivity] = useState(7);
  const [load, setLoad] = useState(3);
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const workTypeWrapRef = useRef<HTMLDivElement | null>(null);

  const blockNum = useSessionStore((s) => s.blockNum);
  const numOfBreaks = useSessionStore((s) => s.numOfBreaks);
  const workMinutes = useSessionStore((s) => s.workMinutes);
  const breakMinutes = useSessionStore((s) => s.breakMinutes);
  const workType = useSessionStore((s) => s.workType);
  const setWorkType = useSessionStore((s) => s.setWorkType);
  const setHasUserRated = useSessionStore((s) => s.setHasUserRated);

  const totalBlocks = numOfBreaks + 1;
  const focusMinutes = workMinutes * 60 - numOfBreaks * breakMinutes;
  const blockMinutes = minutesPerFocusBlock(focusMinutes, totalBlocks);

  useEffect(() => {
    const bodyClass = "rate-session-open";
    if (modalOpen) {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => document.body.classList.remove(bodyClass);
  }, [modalOpen]);

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

  const completeLastBlockIfNeeded = () => {
    const store = useSessionStore.getState();
    if (store.blockNum !== store.numOfBreaks + 1) {
      return;
    }
    void finalizeActivePomodoroSession().then((finalizeResult) => {
      if (finalizeResult.error) {
        console.error("Failed to finalize pomodoro run on the server", finalizeResult.error);
        return;
      }
      const after = useSessionStore.getState();
      after.setSessionComplete(true);
      after.setBlockNum(0);
      after.setHasUserRated(false);
    });
  };

  const handleSave = () => {
    setHasUserRated(true);
    setModalOpen(false);
    setShowRatedToast(true);
    window.localStorage.setItem(String(blockNum), String(productivity));
    window.localStorage.setItem(localBlockLoadKey(blockNum), String(load));
    window.localStorage.setItem(localBlockWorkTypeKey(blockNum), workType);
    void logBlockRatingForCurrentSession(blockNum, productivity, load).then((result) => {
      if (result.error) {
        console.error("Failed to log block rating", result.error);
        return;
      }
      completeLastBlockIfNeeded();
    });
  };

  return (
    <div className="rating">
      <div className="ratingdiv">
        <Modal
          isOpen={modalOpen}
          style={modalStyles}
          contentLabel="Rate your session"
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
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
                Block {blockNum} of {totalBlocks} • {formatBlockMinutes(blockMinutes)}
              </p>
              </div>

              <div className="rateSession__field">
                <span className="rateSession__label" id="rate-work-type-label">
                  Work type
                </span>
                <div className="rateSession__dropdownWrap" ref={workTypeWrapRef}>
                  <button
                    type="button"
                    className="rateSession__dropdown"
                    aria-labelledby="rate-work-type-label"
                    aria-haspopup="listbox"
                    aria-expanded={workTypeOpen}
                    onClick={() => setWorkTypeOpen((open) => !open)}
                  >
                    <span className={`rateSession__typeDot rateSession__typeDot--${workType === "Deep Work" ? "deep" : "routine"}`} aria-hidden />
                    {workType}
                    <HiChevronDown className={`rateSession__chevron${workTypeOpen ? " rateSession__chevron--open" : ""}`} aria-hidden />
                  </button>
                  {workTypeOpen ? (
                    <ul className="rateSession__menu" role="listbox" aria-labelledby="rate-work-type-label">
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
                                setWorkType(type);
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
                titleId="rate-productivity-title"
                title="1. Productivity (1-10)"
                hint="How productive was this block?"
                min={1}
                max={10}
                step={0.25}
                value={productivity}
                onChange={setProductivity}
                lowLabel="Low"
                highLabel="Excellent"
              />

              <RatingScaleSlider
                titleId="rate-load-title"
                title="2. Load / Difficulty (1-5)"
                hint="How mentally demanding or taxing was this block?"
                min={1}
                max={5}
                step={0.25}
                value={load}
                onChange={setLoad}
                lowLabel="Very light"
                highLabel="Very heavy"
              />
            </div>

            <footer className="rateSession__footer">
              <button type="button" className="rateSession__save" onClick={handleSave}>
                Save & Continue
              </button>
            </footer>
          </div>
        </Modal>
        <PerformanceRatedToast
          show={showRatedToast}
          blockNumber={blockNum}
          onDismiss={() => setShowRatedToast(false)}
        />
      </div>
    </div>
  );
};

export default Rating;
