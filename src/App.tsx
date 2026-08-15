import React, { useEffect, useState } from "react";
import "./App.css";
import { waitForImage } from "./lib/waitForImage";
import AuthModal from "./components/auth/AuthModal";
import Sidebar, { type SidebarItemId } from "./components/sidebar/Sidebar";
import Finished from "./components/Finished";
import Howtorate from "./components/Howtorate";
import Logout from "./components/Logout";
import SessionSetupModal from "./components/sessionSetup/SessionSetupModal";
import Chartdisplay from "./components/chart/Chartdisplay";
// import MoodInputModal from "./components/mood/MoodInputModal";
import Theme from "./components/mainbuttons/Theme";
import Timer from "./components/timer/Timer";
import RecentDays from "./components/focus/RecentDays";
import EnergyPage from "./components/energy/EnergyPage";
import StatsPage from "./components/stats/StatsPage";
import DataLoggingErrorToast from "./components/notifications/DataLoggingErrorToast";
import { useAuth } from "./hooks/useAuth";
import { useSessionStore } from "./store/sessionStore";
import { THEME_STREETS } from "./theme/backgrounds";

function App() {
  const { session, loading: authLoading, authError } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarActiveItem, setSidebarActiveItem] = useState<SidebarItemId>("focus");
  /** Background URL to paint; stays on the previous theme until the next image has loaded. */
  const [displayedBackgroundUrl, setDisplayedBackgroundUrl] = useState<string | null>(null);
  /** Centered box while switching themes (min 1s + until decode). */
  const [themeSwitchLoading, setThemeSwitchLoading] = useState(false);
  const theme = useSessionStore((s) => s.theme);
  const showTimerPage = useSessionStore((s) => s.showTimerPage);
  const showSessionSetupModal = useSessionStore((s) => s.showSessionSetupModal);
  const sessionComplete = useSessionStore((s) => s.sessionComplete);
  const data = useSessionStore((s) => s.data);
  const openThemePage = useSessionStore((s) => s.openThemePage);
  const openHowTo = useSessionStore((s) => s.openHowTo);
  const logout = useSessionStore((s) => s.logout);
  const dataLoggingAlert = useSessionStore((s) => s.dataLoggingAlert);
  const setData = useSessionStore((s) => s.setData);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);
  const setShowSessionSetupModal = useSessionStore((s) => s.setShowSessionSetupModal);
  const setShowTimerPage = useSessionStore((s) => s.setShowTimerPage);
  const openDefaultFocusTimer = useSessionStore((s) => s.openDefaultFocusTimer);
  // const openMoodInput = useSessionStore((s) => s.openMoodInput);

  const handleSidebarNavigate = (item: SidebarItemId) => {
    setSidebarActiveItem(item);
    switch (item) {
      case "focus":
        openDefaultFocusTimer();
        break;
      case "stats":
      case "energy":
        setShowSessionSetupModal(false);
        setShowTimerPage(false);
        setOpenThemePage(false);
        setData(false);
        break;
      case "settings":
        setShowSessionSetupModal(false);
        setOpenThemePage(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    localStorage.removeItem("Theme");
  }, []);

  useEffect(() => {
    if (displayedBackgroundUrl === theme) {
      setThemeSwitchLoading(false);
      return;
    }

    let cancelled = false;
    const url = theme;

    const run = async () => {
      if (displayedBackgroundUrl === null) {
        await waitForImage(url);
        if (!cancelled) {
          setDisplayedBackgroundUrl(url);
        }
        return;
      }

      setThemeSwitchLoading(true);
      const startedAt = Date.now();
      await waitForImage(url);
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1000) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 1000 - elapsed);
        });
      }
      if (!cancelled) {
        setDisplayedBackgroundUrl(url);
        setThemeSwitchLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [theme, displayedBackgroundUrl]);

  useEffect(() => {
    if (session) {
      setAuthModalOpen(false);
    }
  }, [session]);

  useEffect(() => {
    const bodyClass = "auth-modal-open";
    if (authModalOpen) {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => document.body.classList.remove(bodyClass);
  }, [authModalOpen]);

  if (authLoading) {
    return <div className="app-auth-loading">Loading…</div>;
  }

  if (authError) {
    return (
      <div className="app-auth-error">
        <p className="app-auth-error-message">Could not restore your session: {authError}</p>
        <button type="button" className="app-auth-error-retry" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (displayedBackgroundUrl === null) {
    return <div className="app-auth-loading">Loading…</div>;
  }

  return (
    <div
      className="App"
      style={
        {
          "--app-theme-image": `url(${displayedBackgroundUrl})`,
          "--app-theme-dim": displayedBackgroundUrl === THEME_STREETS ? "0.35" : "0.2",
        } as React.CSSProperties
      }
    >
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
          {sidebarActiveItem !== "stats" && sidebarActiveItem !== "energy" && (
            <div className={`theTimerContents${showTimerPage ? " theTimerContents--timerHub" : ""}`}>
              {showTimerPage && <Timer />}
              {showTimerPage && <RecentDays />}
            </div>
          )}
          {sidebarActiveItem !== "stats" && sidebarActiveItem !== "energy" && sessionComplete && <Finished />}
        </div>

        <AuthModal isOpen={authModalOpen} onRequestClose={() => setAuthModalOpen(false)} />
        <SessionSetupModal
          isOpen={showSessionSetupModal}
          onRequestClose={() => setShowSessionSetupModal(false)}
        />
        {data && <Chartdisplay />}
        {/* {openMoodInput && <MoodInputModal />} */}
        {openThemePage && <Theme />}
        {openHowTo && <Howtorate />}

        {logout && <Logout />}
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
