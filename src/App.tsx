import React, { useEffect } from "react";
import "./App.css";
import Contents from "./components/Contents";
import Finished from "./components/Finished";
import Howtorate from "./components/Howtorate";
import Logout from "./components/Logout";
import RatingMethod from "./components/setter/RatingMethod";
import Setter from "./components/setter/Setter";
import Chartdisplay from "./components/chart/Chartdisplay";
import Navbar from "./components/sidebar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Synopsis from "./components/sidebar/Synopsis";
import Theme from "./components/sidebar/Theme";
import Timer from "./components/timer/Timer";
import { useSessionStore } from "./store/sessionStore";

function App() {
  const theme = useSessionStore((s) => s.theme);
  const showParagraph = useSessionStore((s) => s.showParagraph);
  const showSetterPage = useSessionStore((s) => s.showSetterPage);
  const showTimerPage = useSessionStore((s) => s.showTimerPage);
  const openMethod = useSessionStore((s) => s.openMethod);
  const sessionComplete = useSessionStore((s) => s.sessionComplete);
  const sideBar = useSessionStore((s) => s.sideBar);
  const data = useSessionStore((s) => s.data);
  const synopsis = useSessionStore((s) => s.synopsis);
  const openThemePage = useSessionStore((s) => s.openThemePage);
  const openHowTo = useSessionStore((s) => s.openHowTo);
  const logout = useSessionStore((s) => s.logout);

  useEffect(() => {
    localStorage.removeItem("Theme");
  }, []);

  return (
    <div className="App" style={{ backgroundImage: `url(${theme})` }}>
      <div className={`theApp${sideBar ? " theApp--withSidebar" : ""}`}>
        <div className="mainStage">
          <Navbar />
          {showParagraph && <Contents />}
          <div className="theTimerContents">
            {openMethod && <RatingMethod />}
            {showSetterPage && <Setter />}
            {showTimerPage && <Timer />}
          </div>
          {sessionComplete && <Finished />}
        </div>

        {sideBar && <Sidebar />}
        {data && <Chartdisplay />}
        {synopsis && <Synopsis />}
        {openThemePage && <Theme />}
        {openHowTo && <Howtorate />}

        {logout && <Logout />}
      </div>
    </div>
  );
}

export default App;
