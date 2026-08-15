import React, { useEffect, useState } from "react";
import "./App.css";
import AuthModal from "./components/auth/AuthModal";
import Sidebar, { type SidebarItemId } from "./components/sidebar/Sidebar";
import Finished from "./components/Finished";
import Logout from "./components/Logout";
import SessionSetupModal from "./components/sessionSetup/SessionSetupModal";
import Chartdisplay from "./components/chart/Chartdisplay";
import Theme from "./components/mainbuttons/Theme";
import Timer from "./components/timer/Timer";
import RecentDays from "./components/focus/RecentDays";
import EnergyPage from "./components/energy/EnergyPage";
import StatsPage from "./components/stats/StatsPage";
import DataLoggingErrorToast from "./components/notifications/DataLoggingErrorToast";
import { useAuth } from "./hooks/useAuth";
import { useThemeBackground } from "./hooks/useThemeBackground";
import { clearPersistedTimer } from "./lib/timerPersistence";
import { useSessionStore } from "./store/sessionStore";
import { THEME_STREETS } from "./theme/backgrounds";

// Types
type AppThemeCssVars = React.CSSProperties & {
  "--app-theme-image": string;
  "--app-theme-dim": string;
};

type SidebarNavigateActions = {
  openDefaultFocusTimer: () => void;
  setShowSessionSetupModal: (open: boolean) => void;
  setShowTimerPage: (open: boolean) => void;
  setOpenThemePage: (open: boolean) => void;
  setShowChartDisplay: (open: boolean) => void;
};

// Constants
const AUTH_MODAL_BODY_CLASS = "auth-modal-open";

// Helpers
function themeCssVariables(displayedBackgroundUrl: string): AppThemeCssVars {
  return {
    "--app-theme-image": `url(${displayedBackgroundUrl})`,
    "--app-theme-dim": displayedBackgroundUrl === THEME_STREETS ? "0.35" : "0.2",
  };
}

function navigateFromSidebar(itemId: SidebarItemId, actions: SidebarNavigateActions) {
  switch (itemId) {
    case "focus":
      actions.openDefaultFocusTimer();
      break;
    case "stats":
    case "energy":
      actions.setShowSessionSetupModal(false);
      actions.setShowTimerPage(false);
      actions.setOpenThemePage(false);
      actions.setShowChartDisplay(false);
      break;
    case "settings":
      actions.setShowSessionSetupModal(false);
      actions.setOpenThemePage(true);
      break;
    default:
      break;
  }
}

function AppAuthLoading() {
  return <div className="app-auth-loading">Loading…</div>;
}

function AppAuthError({ message }: { message: string }) {
  return (
    <div className="app-auth-error">
      <p className="app-auth-error-message">Could not restore your session: {message}</p>
      <button type="button" className="app-auth-error-retry" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}

// Component
function App() {
  const { session, loading: authLoading, authError } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarActiveItem, setSidebarActiveItem] = useState<SidebarItemId>("focus");

  const theme = useSessionStore((state) => state.theme);
  const showTimerPage = useSessionStore((state) => state.showTimerPage);
  const showSessionSetupModal = useSessionStore((state) => state.showSessionSetupModal);
  const sessionComplete = useSessionStore((state) => state.sessionComplete);
  const showChartDisplay = useSessionStore((state) => state.data);
  const openThemePage = useSessionStore((state) => state.openThemePage);
  const showLogout = useSessionStore((state) => state.logout);
  const dataLoggingAlert = useSessionStore((state) => state.dataLoggingAlert);
  const setShowChartDisplay = useSessionStore((state) => state.setData);
  const setOpenThemePage = useSessionStore((state) => state.setOpenThemePage);
  const setShowSessionSetupModal = useSessionStore((state) => state.setShowSessionSetupModal);
  const setShowTimerPage = useSessionStore((state) => state.setShowTimerPage);
  const openDefaultFocusTimer = useSessionStore((state) => state.openDefaultFocusTimer);

  const { displayedBackgroundUrl, themeSwitchLoading } = useThemeBackground(theme);

  const handleSidebarNavigate = (itemId: SidebarItemId) => {
    setSidebarActiveItem(itemId);
    navigateFromSidebar(itemId, {
      openDefaultFocusTimer,
      setShowSessionSetupModal,
      setShowTimerPage,
      setOpenThemePage,
      setShowChartDisplay,
    });
  };

  useEffect(() => {
    localStorage.removeItem("Theme");
    clearPersistedTimer();
    useSessionStore.getState().restartTimerAfterPageLoad();
  }, []);

  useEffect(() => {
    if (session) {
      setAuthModalOpen(false);
    }
  }, [session]);

  useEffect(() => {
    if (authModalOpen) {
      document.body.classList.add(AUTH_MODAL_BODY_CLASS);
    } else {
      document.body.classList.remove(AUTH_MODAL_BODY_CLASS);
    }
    return () => document.body.classList.remove(AUTH_MODAL_BODY_CLASS);
  }, [authModalOpen]);

  const showFocusHub = sidebarActiveItem !== "stats" && sidebarActiveItem !== "energy";

  // Render
  if (authLoading) {
    return <AppAuthLoading />;
  }

  if (authError) {
    return <AppAuthError message={authError} />;
  }

  if (displayedBackgroundUrl === null) {
    return <AppAuthLoading />;
  }

  return (
    <div className="App" style={themeCssVariables(displayedBackgroundUrl)}>
      <Sidebar
        user={session?.user ?? null}
        activeItem={sidebarActiveItem}
        onNavigate={handleSidebarNavigate}
        onOpenSignIn={() => setAuthModalOpen(true)}
      />
      <div className="theApp">
        <div className="mainStage mainStage--hubWireframe">
          {sidebarActiveItem === "stats" && <StatsPage />}
          {sidebarActiveItem === "energy" && <EnergyPage />}
          {showFocusHub && (
            <div className={`theTimerContents${showTimerPage ? " theTimerContents--timerHub" : ""}`}>
              {showTimerPage && <Timer />}
              {showTimerPage && <RecentDays />}
            </div>
          )}
          {showFocusHub && sessionComplete && <Finished />}
        </div>

        <AuthModal isOpen={authModalOpen} onRequestClose={() => setAuthModalOpen(false)} />
        <SessionSetupModal
          isOpen={showSessionSetupModal}
          onRequestClose={() => setShowSessionSetupModal(false)}
        />
        {showChartDisplay && <Chartdisplay />}
        {openThemePage && <Theme />}
        {showLogout && <Logout />}
        <DataLoggingErrorToast
          show={Boolean(dataLoggingAlert)}
          title={dataLoggingAlert?.title ?? ""}
          body={dataLoggingAlert?.body ?? ""}
        />
        {themeSwitchLoading && (
          <div className="app-theme-switch-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="app-theme-switch-box">Loading…</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
