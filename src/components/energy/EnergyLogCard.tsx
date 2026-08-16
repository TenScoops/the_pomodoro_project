import React, { useEffect, useId, useState } from "react";
import { ENERGY_LEVELS, type EnergyLevel } from "../../constants/energyLevels";
import type { EnergyLogRecord } from "../../services/pomoprogressService";
import type { EnergyLogsStatus, EnergySaveStatus } from "../../hooks/useEnergyLogs";
import "./EnergyLogCard.css";

const NOTE_MAX_LENGTH = 500;

interface EnergyLogCardProps {
  status: EnergyLogsStatus;
  saveStatus: EnergySaveStatus;
  todayLog: EnergyLogRecord | null;
  onSave: (energy: EnergyLevel, note: string) => void;
  onRetry: () => void;
}

export default function EnergyLogCard({ status, saveStatus, todayLog, onSave, onRetry }: EnergyLogCardProps) {
  const [energy, setEnergy] = useState<EnergyLevel>(todayLog?.energy ?? 5);
  const [note, setNote] = useState(todayLog?.note ?? "");
  const [dirty, setDirty] = useState(false);
  const notesId = useId();

  useEffect(() => {
    setEnergy(todayLog?.energy ?? 5);
    setNote(todayLog?.note ?? "");
    setDirty(false);
  }, [todayLog]);

  useEffect(() => {
    if (saveStatus === "saved") {
      setDirty(false);
    }
  }, [saveStatus]);

  return (
    <article className="energyLogCard" aria-label="Log your energy">
      <h2 className="energyLogCard__title">Log your energy</h2>
      <p className="energyLogCard__subtitle">How is your energy right now?</p>

      {status === "loading" ? (
        <div className="energyLogCard__skeleton" aria-busy="true">
          <div className="energyLogCard__skeletonBar" />
          <div className="energyLogCard__skeletonBar energyLogCard__skeletonBar--short" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="energyLogCard__error" role="alert">
          <p>Could not load today&apos;s energy log.</p>
          <button type="button" className="energyLogCard__retry" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          <div className="energyLogCard__scale" role="radiogroup" aria-label="Energy from 1 low to 5 great">
            <span className="energyLogCard__rail" aria-hidden />
            {ENERGY_LEVELS.map((level) => {
              const selected = energy === level.value;
              const FaceIcon = level.Icon;
              return (
                <button
                  key={level.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Energy ${level.value}, ${level.caption}`}
                  className={`energyLogCard__step${selected ? " energyLogCard__step--selected" : ""}`}
                  style={{ "--energy-color": level.color } as React.CSSProperties}
                  onClick={() => {
                    setEnergy(level.value);
                    setDirty(true);
                  }}
                >
                  <span className="energyLogCard__number">{level.value}</span>
                  <span className="energyLogCard__face">
                    <FaceIcon aria-hidden className="energyLogCard__icon" />
                  </span>
                  <span className="energyLogCard__caption">{level.caption}</span>
                </button>
              );
            })}
          </div>

          <div className="energyLogCard__field">
            <label className="energyLogCard__label" htmlFor={notesId}>
              Notes (optional)
            </label>
            <textarea
              id={notesId}
              className="energyLogCard__textarea"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              rows={4}
              placeholder="Felt energized and focused. Good sleep and a productive morning."
              onChange={(event) => {
                setNote(event.target.value);
                setDirty(true);
              }}
            />
          </div>

          <footer className="energyLogCard__footer">
            {saveStatus === "saved" && !dirty ? <p className="energyLogCard__saved">Saved</p> : null}
            <button
              type="button"
              className="energyLogCard__save"
              onClick={() => onSave(energy, note)}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? "Saving…" : "Save Energy"}
            </button>
          </footer>
        </>
      ) : null}
    </article>
  );
}
