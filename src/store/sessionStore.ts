import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STREETS } from "../theme/backgrounds";

/**
 * Pomodoro session UI state (replaces the previous React context).
 * Theme is persisted so the background survives reloads; other fields are session-only.
 */

/** Mirrors `activeSupabaseSessionId` so finalize can find the draft after refresh / remount. */
export const ACTIVE_SESSION_ID_STORAGE_KEY = "pomoprogress_active_session_id";

export type SessionState = {
  closeRatingModal: boolean;
  workMinutes: number;
  breakMinutes: number;
  showSetterPage: boolean;
  showTimerPage: boolean;
  numOfBreaks: number;
  showParagraph: boolean;
  showButtons: boolean;
  showData: boolean;
  isWorkGreater: boolean;
  modalOpen: boolean;
  clicked: boolean;
  hasUserRated: boolean;
  cancelTheSession: boolean;
  blockNum: number;
  sessionComplete: boolean;
  openTask: boolean;
  sideBar: boolean;
  hideButton: boolean;
  synopsis: boolean;
  data: boolean;
  logout: boolean;
  openThemePage: boolean;
  openHowTo: boolean;
  openMethod: boolean;
  showClock: boolean;
  option: string | undefined;
  theme: string;
  /** Supabase `sessions.id` for the in-progress pomodoro; blocks append here as the user rates each block. */
  activeSupabaseSessionId: string | null;
  /** Bumped after block/session DB writes so charts refetch live data. */
  chartDataRevision: number;
  /** Persistent error toast (manual dismiss) when logging to Supabase fails or looks wrong. */
  dataLoggingAlert: { title: string; body: string } | null;
  /** Mood picker modal (frontend; persistence can come later). */
  openMoodInput: boolean;
  /** Display label for the mood the user chose (e.g. "Happy"). */
  moodSelection: string | null;
};

export type SessionActions = {
  setCloseRatingModal: (value: boolean) => void;
  setWorkMinutes: (value: number) => void;
  setBreakMinutes: (value: number) => void;
  setShowSetterPage: (value: boolean) => void;
  setShowTimerPage: (value: boolean) => void;
  setNumOfBreaks: (value: number) => void;
  setShowParagraph: (value: boolean) => void;
  setShowButtons: (value: boolean) => void;
  setShowData: (value: boolean) => void;
  setIsWorkGreater: (value: boolean) => void;
  setModalOpen: (value: boolean) => void;
  setClicked: (value: boolean) => void;
  setHasUserRated: (value: boolean) => void;
  setCancelTheSession: (value: boolean) => void;
  setBlockNum: (value: number | ((previous: number) => number)) => void;
  setSessionComplete: (value: boolean) => void;
  setOpenTask: (value: boolean) => void;
  setSideBar: (value: boolean) => void;
  setHideButton: (value: boolean) => void;
  setSynopsis: (value: boolean) => void;
  setData: (value: boolean) => void;
  setLogout: (value: boolean) => void;
  setOpenThemePage: (value: boolean) => void;
  setOpenHowTo: (value: boolean) => void;
  setOpenMethod: (value: boolean) => void;
  setShowClock: (value: boolean) => void;
  setOption: (value: string | undefined) => void;
  setTheme: (value: string) => void;
  setActiveSupabaseSessionId: (value: string | null) => void;
  setDataLoggingAlert: (value: { title: string; body: string } | null) => void;
  bumpChartDataRevision: () => void;
  setOpenMoodInput: (value: boolean) => void;
  setMoodSelection: (value: string | null) => void;
};

const initialSessionState: SessionState = {
  closeRatingModal: false,
  workMinutes: 1,
  breakMinutes: 10,
  showSetterPage: false,
  showTimerPage: false,
  numOfBreaks: 1,
  showParagraph: true,
  showButtons: false,
  showData: true,
  isWorkGreater: false,
  modalOpen: true,
  clicked: false,
  hasUserRated: false,
  cancelTheSession: false,
  blockNum: 1,
  sessionComplete: false,
  openTask: false,
  sideBar: true,
  hideButton: true,
  synopsis: false,
  data: false,
  logout: false,
  openThemePage: false,
  openHowTo: false,
  openMethod: false,
  showClock: false,
  option: undefined,
  theme: THEME_STREETS,
  activeSupabaseSessionId: null,
  chartDataRevision: 0,
  dataLoggingAlert: null,
  openMoodInput: false,
  moodSelection: null,
};

/** Best-effort read of legacy `use-local-storage` key so users keep their background image. */
function readLegacyTheme(): string {
  try {
    const raw = localStorage.getItem("Themes");
    if (!raw) return THEME_STREETS;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === "string") return parsed;
    } catch {
      if (raw.startsWith("http") || raw.startsWith("/") || raw.includes(".webp")) {
        return raw;
      }
    }
  } catch {
    /* ignore */
  }
  return THEME_STREETS;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialSessionState,
      theme: typeof window !== "undefined" ? readLegacyTheme() : THEME_STREETS,

      setCloseRatingModal: (value) => set({ closeRatingModal: value }),
      setWorkMinutes: (value) => set({ workMinutes: value }),
      setBreakMinutes: (value) => set({ breakMinutes: value }),
      setShowSetterPage: (value) => set({ showSetterPage: value }),
      setShowTimerPage: (value) => set({ showTimerPage: value }),
      setNumOfBreaks: (value) => set({ numOfBreaks: value }),
      setShowParagraph: (value) => set({ showParagraph: value }),
      setShowButtons: (value) => set({ showButtons: value }),
      setShowData: (value) => set({ showData: value }),
      setIsWorkGreater: (value) => set({ isWorkGreater: value }),
      setModalOpen: (value) => set({ modalOpen: value }),
      setClicked: (value) => set({ clicked: value }),
      setHasUserRated: (value) => set({ hasUserRated: value }),
      setCancelTheSession: (value) => set({ cancelTheSession: value }),
      setBlockNum: (value) =>
        set((state) => ({
          blockNum: typeof value === "function" ? value(state.blockNum) : value,
        })),
      setSessionComplete: (value) => set({ sessionComplete: value }),
      setOpenTask: (value) => set({ openTask: value }),
      setSideBar: (value) => set({ sideBar: value }),
      setHideButton: (value) => set({ hideButton: value }),
      setSynopsis: (value) => set({ synopsis: value }),
      setData: (value) => set({ data: value }),
      setLogout: (value) => set({ logout: value }),
      setOpenThemePage: (value) => set({ openThemePage: value }),
      setOpenHowTo: (value) => set({ openHowTo: value }),
      setOpenMethod: (value) => set({ openMethod: value }),
      setShowClock: (value) => set({ showClock: value }),
      setOption: (value) => set({ option: value }),
      setTheme: (value) => set({ theme: value }),
      setActiveSupabaseSessionId: (value) => {
        set({ activeSupabaseSessionId: value });
        try {
          if (typeof window !== "undefined") {
            if (value) {
              window.localStorage.setItem(ACTIVE_SESSION_ID_STORAGE_KEY, value);
            } else {
              window.localStorage.removeItem(ACTIVE_SESSION_ID_STORAGE_KEY);
            }
          }
        } catch {
          /* ignore quota / private mode */
        }
      },
      setDataLoggingAlert: (value) => set({ dataLoggingAlert: value }),
      bumpChartDataRevision: () =>
        set((state) => ({ chartDataRevision: state.chartDataRevision + 1 })),
      setOpenMoodInput: (value) => set({ openMoodInput: value }),
      setMoodSelection: (value) => set({ moodSelection: value }),
    }),
    {
      name: "pomoprogress-session",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
