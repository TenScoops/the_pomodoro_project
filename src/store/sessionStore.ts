import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_LANDSCAPE } from "../theme/backgrounds";
import type { SessionWorkType } from "../components/sessionSetup/sessionSetupMath";

/**
 * Pomodoro session UI state (replaces the previous React context).
 * Theme is persisted so the background survives reloads; other fields are session-only.
 */

/** Mirrors `activeSupabaseSessionId` so finalize can find the draft after refresh / remount. */
export const ACTIVE_SESSION_ID_STORAGE_KEY = "pomoprogress_active_session_id";

/**
 * Default Focus session: 1 hour total with one 10-minute break.
 * Work time is split across (breaks + 1) blocks, so that is two 25-minute work blocks.
 */
export const DEFAULT_SESSION_HOURS = 1;
export const DEFAULT_BREAK_MINUTES = 10;
export const DEFAULT_NUM_OF_BREAKS = 1;

export type SessionState = {
  closeRatingModal: boolean;
  workMinutes: number;
  breakMinutes: number;
  showSessionSetupModal: boolean;
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
  data: boolean;
  logout: boolean;
  openThemePage: boolean;
  openHowTo: boolean;
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
  workType: SessionWorkType;
};

export type SessionActions = {
  setCloseRatingModal: (value: boolean) => void;
  setWorkMinutes: (value: number) => void;
  setBreakMinutes: (value: number) => void;
  setShowSessionSetupModal: (value: boolean) => void;
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
  setData: (value: boolean) => void;
  setLogout: (value: boolean) => void;
  setOpenThemePage: (value: boolean) => void;
  setOpenHowTo: (value: boolean) => void;
  setShowClock: (value: boolean) => void;
  setOption: (value: string | undefined) => void;
  setTheme: (value: string) => void;
  setActiveSupabaseSessionId: (value: string | null) => void;
  setDataLoggingAlert: (value: { title: string; body: string } | null) => void;
  bumpChartDataRevision: () => void;
  setOpenMoodInput: (value: boolean) => void;
  setMoodSelection: (value: string | null) => void;
  setWorkType: (value: SessionWorkType) => void;
  applySessionSetup: (values: {
    workMinutesHours: number;
    numOfBreaks: number;
    breakMinutes: number;
    workType: SessionWorkType;
  }) => void;
  /** Show the timer with the default 50-minute focus / 10-minute break session. */
  openDefaultFocusTimer: () => void;
};

const initialSessionState: SessionState = {
  closeRatingModal: false,
  workMinutes: DEFAULT_SESSION_HOURS,
  breakMinutes: DEFAULT_BREAK_MINUTES,
  showSessionSetupModal: false,
  showTimerPage: true,
  numOfBreaks: DEFAULT_NUM_OF_BREAKS,
  showParagraph: false,
  showButtons: true,
  showData: false,
  isWorkGreater: false,
  modalOpen: true,
  clicked: false,
  hasUserRated: false,
  cancelTheSession: false,
  blockNum: 1,
  sessionComplete: false,
  openTask: false,
  data: false,
  logout: false,
  openThemePage: false,
  openHowTo: false,
  showClock: true,
  option: undefined,
  theme: THEME_LANDSCAPE,
  activeSupabaseSessionId: null,
  chartDataRevision: 0,
  dataLoggingAlert: null,
  openMoodInput: false,
  moodSelection: null,
  workType: "Deep Work",
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialSessionState,

      setCloseRatingModal: (value) => set({ closeRatingModal: value }),
      setWorkMinutes: (value) => set({ workMinutes: value }),
      setBreakMinutes: (value) => set({ breakMinutes: value }),
      setShowSessionSetupModal: (value) => set({ showSessionSetupModal: value }),
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
      setData: (value) => set({ data: value }),
      setLogout: (value) => set({ logout: value }),
      setOpenThemePage: (value) => set({ openThemePage: value }),
      setOpenHowTo: (value) => set({ openHowTo: value }),
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
      setWorkType: (value) => set({ workType: value }),
      applySessionSetup: (values) =>
        set({
          workMinutes: values.workMinutesHours,
          numOfBreaks: values.numOfBreaks,
          breakMinutes: values.breakMinutes,
          workType: values.workType,
          showSessionSetupModal: false,
          showTimerPage: true,
          showButtons: true,
          showClock: true,
          showData: false,
          sessionComplete: false,
          blockNum: 1,
          hasUserRated: false,
        }),
      openDefaultFocusTimer: () =>
        set({
          workMinutes: DEFAULT_SESSION_HOURS,
          breakMinutes: DEFAULT_BREAK_MINUTES,
          numOfBreaks: DEFAULT_NUM_OF_BREAKS,
          workType: "Deep Work",
          showSessionSetupModal: false,
          showTimerPage: true,
          showParagraph: false,
          showButtons: true,
          showClock: true,
          showData: false,
          clicked: true,
          sessionComplete: false,
          data: false,
          openThemePage: false,
        }),
    }),
    {
      name: "pomoprogress-session",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
