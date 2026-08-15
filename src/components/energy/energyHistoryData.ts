import type { EnergyLevel } from "../../constants/energyLevels";

export interface EnergyHistoryRow {
  id: string;
  dateLabel: string;
  energy: EnergyLevel;
  note: string;
}

export const ENERGY_HISTORY_AVERAGE = "3.8";
export const ENERGY_HISTORY_TREND_PERCENT = 9;
export const ENERGY_HISTORY_DAYS_TRACKED = 12;

/** Placeholder rows so Energy History is filled before live logs are wired up. */
export const ENERGY_HISTORY_ROWS: EnergyHistoryRow[] = [
  {
    id: "may14",
    dateLabel: "Today, May 14",
    energy: 5,
    note: "Felt energized and focused. Good sleep and a productive morning.",
  },
  {
    id: "may13",
    dateLabel: "Yesterday, May 13",
    energy: 4,
    note: "Good energy after lunch. Afternoon was a bit slower.",
  },
  {
    id: "may12",
    dateLabel: "May 12, 2024",
    energy: 3,
    note: "A bit tired in the afternoon but pushed through.",
  },
  {
    id: "may11",
    dateLabel: "May 11, 2024",
    energy: 4,
    note: "Solid morning. Energy dipped after meetings.",
  },
  {
    id: "may10",
    dateLabel: "May 10, 2024",
    energy: 2,
    note: "Low energy, poor sleep the night before.",
  },
];
