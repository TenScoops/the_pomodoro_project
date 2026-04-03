import "./Setter.css";
import React from "react";
import ReactSlider from "react-slider";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";
import { useSessionStore } from "../../store/sessionStore";

const Setter = () => {
  const workMinutes = useSessionStore((s) => s.workMinutes);
  const numOfBreaks = useSessionStore((s) => s.numOfBreaks);
  const breakMinutes = useSessionStore((s) => s.breakMinutes);
  const clicked = useSessionStore((s) => s.clicked);
  const showTimerPage = useSessionStore((s) => s.showTimerPage);
  const setWorkMinutes = useSessionStore((s) => s.setWorkMinutes);
  const setNumOfBreaks = useSessionStore((s) => s.setNumOfBreaks);
  const setBreakMinutes = useSessionStore((s) => s.setBreakMinutes);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setShowButtons = useSessionStore((s) => s.setShowButtons);
  const setShowClock = useSessionStore((s) => s.setShowClock);
  const setShowData = useSessionStore((s) => s.setShowData);
  const setShowTimerPage = useSessionStore((s) => s.setShowTimerPage);
  const setShowParagraph = useSessionStore((s) => s.setShowParagraph);
  const setClicked = useSessionStore((s) => s.setClicked);

  const goForward = () => {
    setShowSetterPage(false);
    setShowButtons(true);
    setShowClock(true);
    setShowData(false);
  };

  const goBack = () => {
    setShowSetterPage(false);
    setShowTimerPage(false);
    setShowParagraph(true);
    setClicked(false);
  };

  const breaks = numOfBreaks === 1 ? "break" : "breaks";

  return (
    <div className="divsetter">
      <div className="setter">
        <h1 className="header" style={{}}>
          Create a session{" "}
        </h1>
        <p className="session-label">{workMinutes} hour session</p>

        <ReactSlider
          className={"slider"}
          thumbClassName={"thumb"}
          trackClassName={"track"}
          value={workMinutes}
          onChange={(newValue) => setWorkMinutes(newValue)}
          min={1}
          max={12}
        />

        <p className="session-label">
          {numOfBreaks} {breaks}
        </p>
        <ReactSlider
          className={"slider"}
          thumbClassName={"thumb"}
          trackClassName={"track"}
          value={numOfBreaks}
          onChange={(newValue) => setNumOfBreaks(newValue)}
          min={0}
          max={20}
        />

        <p className="session-label">{breakMinutes} Mins per break</p>
        <ReactSlider
          className={"slider"}
          thumbClassName={"thumb"}
          trackClassName={"track"}
          value={breakMinutes}
          onChange={(newValue) => setBreakMinutes(newValue)}
          min={1}
          max={60}
        />

        <div className="nextbackbuttons">
          <button className="backbutton" title="Back" type="button" onClick={() => goBack()}>
            <BsArrowLeft style={{ fontSize: "42px" }} />
          </button>

          {clicked ? null : (
            <button
              className="nextbutton"
              title="Next"
              type="button"
              onClick={() => {
                setClicked(true);
                showTimerPage ? setShowTimerPage(false) : setShowTimerPage(true);
              }}
            >
              <BsArrowRight style={{ fontSize: "42px", marginLeft: "4px" }} />
            </button>
          )}

          {clicked ? (
            <button className="checkbutton" title="Next" type="button" onClick={() => goForward()}>
              <BsArrowRight style={{ fontSize: "42px", marginLeft: "4px" }} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Setter;
