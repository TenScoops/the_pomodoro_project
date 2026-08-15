import React, { useId, useState } from "react";
import { ENERGY_LEVELS, type EnergyLevel } from "../../constants/energyLevels";
import "./EnergyLogCard.css";

export default function EnergyLogCard() {
  const [energy, setEnergy] = useState<EnergyLevel>(5);
  const notesId = useId();

  return (
    <article className="energyLogCard" aria-label="Log your energy">
      <h2 className="energyLogCard__title">Log your energy</h2>
      <p className="energyLogCard__subtitle">How is your energy right now?</p>

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
              onClick={() => setEnergy(level.value)}
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
          rows={4}
          placeholder="Felt energized and focused. Good sleep and a productive morning."
        />
      </div>

      <footer className="energyLogCard__footer">
        <button type="button" className="energyLogCard__save">
          Save Energy
        </button>
      </footer>
    </article>
  );
}
