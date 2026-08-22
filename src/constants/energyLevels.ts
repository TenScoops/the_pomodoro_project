import type { IconType } from "react-icons";
import { FaFrown, FaGrin, FaMeh, FaSmile } from "react-icons/fa";

/** Daily energy score: whole faces plus midpoints between them. */
export type EnergyLevel = 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

export type EnergyFaceLevel = 1 | 2 | 3 | 4 | 5;

export interface EnergyLevelOption {
  value: EnergyFaceLevel;
  caption: string;
  Icon: IconType;
  color: string;
}

/** Midpoints between faces — clickable ticks on the energy scale. */
export const ENERGY_HALF_STEPS: readonly EnergyLevel[] = [1.5, 2.5, 3.5, 4.5];

export const ENERGY_LEVEL_VALUES: readonly EnergyLevel[] = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/** Five energy faces, 1 = Low through 5 = Great. */
export const ENERGY_LEVELS: readonly EnergyLevelOption[] = [
  { value: 1, caption: "Low", Icon: FaFrown, color: "#f87171" },
  { value: 2, caption: "Fair", Icon: FaFrown, color: "#fb923c" },
  { value: 3, caption: "Okay", Icon: FaMeh, color: "#facc15" },
  { value: 4, caption: "Good", Icon: FaSmile, color: "#86efac" },
  { value: 5, caption: "Great", Icon: FaGrin, color: "#4ade80" },
];

export function isEnergyLevel(value: number): value is EnergyLevel {
  return (ENERGY_LEVEL_VALUES as readonly number[]).includes(value);
}

/**
 * Postgres `numeric` often arrives as `"4.0"` or a nearby float.
 * Snap to the nearest half step when the value is already on that scale.
 */
export function parseEnergyLevel(value: number | string): EnergyLevel | null {
  const numeric = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const nearestHalfStep = Math.round(numeric * 2) / 2;
  if (Math.abs(numeric - nearestHalfStep) > 0.001) {
    return null;
  }
  if (!isEnergyLevel(nearestHalfStep)) {
    return null;
  }
  return nearestHalfStep;
}

/** Half steps borrow the nearest face for icon and color. */
export function energyFaceForLevel(value: EnergyLevel): EnergyFaceLevel {
  const rounded = Math.round(value);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as EnergyFaceLevel;
}

export function energyLevelOption(value: EnergyLevel): EnergyLevelOption {
  const face = energyFaceForLevel(value);
  const option = ENERGY_LEVELS.find((level) => level.value === face);
  const fallback = ENERGY_LEVELS[0];
  if (!fallback) {
    throw new Error("ENERGY_LEVELS must not be empty.");
  }
  return option ?? fallback;
}
