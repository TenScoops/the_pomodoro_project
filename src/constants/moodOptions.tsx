import type { IconType } from "react-icons";
import { FaAngry, FaFrown, FaMeh, FaSadTear, FaSmile, FaTired } from "react-icons/fa";

export type MoodOption = {
  id: string;
  label: string;
  Icon: IconType;
};

/** Six mood tiers — vector icons from react-icons (Font Awesome), monochrome via CSS. */
export const MOOD_OPTIONS: readonly MoodOption[] = [
  { id: "happy", label: "Happy", Icon: FaSmile },
  { id: "ok", label: "Ok", Icon: FaMeh },
  { id: "angry", label: "Angry", Icon: FaAngry },
  { id: "sad", label: "Sad", Icon: FaFrown },
  { id: "really_sad", label: "Really sad", Icon: FaSadTear },
  { id: "depressed", label: "Depressed", Icon: FaTired },
];
