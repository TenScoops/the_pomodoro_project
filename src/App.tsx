import React, { useEffect, useState } from "react";
import "./App.css";
import AuthModal from "./components/auth/AuthModal";
import Finished from "./components/Finished";
import Howtorate from "./components/Howtorate";
import Logout from "./components/Logout";
import RatingMethod from "./components/setter/RatingMethod";
import Setter from "./components/setter/Setter";
import Chartdisplay from "./components/chart/Chartdisplay";
// import MoodInputModal from "./components/mood/MoodInputModal";
import { CenterQuadStage, MainHubHeader, TimerHubIconBar } from "./components/sidebar/Sidebar";
import Synopsis from "./components/sidebar/Synopsis";
import Theme from "./components/sidebar/Theme";
import Timer from "./components/timer/Timer";
import DataLoggingErrorToast from "./components/notifications/DataLoggingErrorToast";
import { useAuth } from "./hooks/useAuth";
import { useSessionStore } from "./store/sessionStore";

function App() {
  const { session, loading: authLoading, authError } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const theme = useSessionStore((s) => s.theme);
  const showParagraph = useSessionStore((s) => s.showParagraph);
  const showSetterPage = useSessionStore((s) => s.showSetterPage);
  const showTimerPage = useSessionStore((s) => s.showTimerPage);
  const openMethod = useSessionStore((s) => s.openMethod);
  const sessionComplete = useSessionStore((s) => s.sessionComplete);
  const data = useSessionStore((s) => s.data);
  const synopsis = useSessionStore((s) => s.synopsis);
  const openThemePage = useSessionStore((s) => s.openThemePage);
  const openHowTo = useSessionStore((s) => s.openHowTo);
  const logout = useSessionStore((s) => s.logout);
  const dataLoggingAlert = useSessionStore((s) => s.dataLoggingAlert);
  const setCenterFocus = useSessionStore((s) => s.setCenterFocus);
  // const openMoodInput = useSessionStore((s) => s.openMoodInput);

  useEffect(() => {
    localStorage.removeItem("Theme");
  }, []);

  useEffect(() => {
    if (session) {
      setAuthModalOpen(false);
    }
  }, [session]);

  useEffect(() => {
    if (showParagraph) {
      setCenterFocus("session");
    }
  }, [showParagraph, setCenterFocus]);

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

  return (
    <div className="App" style={{ backgroundImage: `url(${theme})` }}>
      <div className="theApp">
        <div className="mainStage mainStage--hubWireframe">
          {!showSetterPage && !showTimerPage && (
            <>
              <MainHubHeader user={session?.user ?? null} />
              <CenterQuadStage
                user={session?.user ?? null}
                onOpenSignIn={() => setAuthModalOpen(true)}
                isAuthModalOpen={authModalOpen}
              />
            </>
          )}
          <div className={`theTimerContents${showTimerPage ? " theTimerContents--timerHub" : ""}`}>
            {showTimerPage && <TimerHubIconBar />}
            {openMethod && <RatingMethod />}
            {showSetterPage && <Setter />}
            {showTimerPage && <Timer />}
          </div>
          {sessionComplete && <Finished />}
        </div>

        <AuthModal isOpen={authModalOpen} onRequestClose={() => setAuthModalOpen(false)} />
        {data && <Chartdisplay />}
        {/* {openMoodInput && <MoodInputModal />} */}
        {synopsis && <Synopsis />}
        {openThemePage && <Theme />}
        {openHowTo && <Howtorate />}

        {logout && <Logout />}
        <DataLoggingErrorToast
          show={Boolean(dataLoggingAlert)}
          title={dataLoggingAlert?.title ?? ""}
          body={dataLoggingAlert?.body ?? ""}
        />
      </div>
    </div>
  );
}

export default App;
