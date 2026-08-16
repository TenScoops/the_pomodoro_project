import type { IconType } from "react-icons";
import { FaFrown, FaGrin, FaMeh, FaSmile } from "react-icons/fa";

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface EnergyLevelOption {
  value: EnergyLevel;
  caption: string;
  Icon: IconType;
  color: string;
}

/** Five energy faces, 1 = Low through 5 = Great. */
export const ENERGY_LEVELS: readonly EnergyLevelOption[] = [
  { value: 1, caption: "Low", Icon: FaFrown, color: "#f87171" },
  { value: 2, caption: "Fair", Icon: FaFrown, color: "#fb923c" },
  { value: 3, caption: "Okay", Icon: FaMeh, color: "#facc15" },
  { value: 4, caption: "Good", Icon: FaSmile, color: "#86efac" },
  { value: 5, caption: "Great", Icon: FaGrin, color: "#4ade80" },
];

export function energyLevelOption(value: EnergyLevel): EnergyLevelOption {
  const option = ENERGY_LEVELS.find((level) => level.value === value);
  const fallback = ENERGY_LEVELS[0];
  if (!fallback) {
    throw new Error("ENERGY_LEVELS must not be empty.");
  }
  return option ?? fallback;
}
