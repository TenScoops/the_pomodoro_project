import React from "react";
import "./EnergyPage.css";

/** Energy tab shell. Charts and logging land here later; empty until then. */
export default function EnergyPage() {
  return (
    <section className="energyPage" aria-label="Energy">
      <header className="energyPage__header">
        <h1 className="energyPage__title">Energy</h1>
      </header>
      <p className="energyPage__empty">No energy data to show yet.</p>
    </section>
  );
}
