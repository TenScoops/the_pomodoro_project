import "./RatingMethod.css";
import React, { useState } from "react";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";
import { AiOutlineCheck } from "react-icons/ai";
import { useSessionStore } from "../../store/sessionStore";

const RatingMethod = () => {
  const clicked = useSessionStore((s) => s.clicked);
  const showTimerPage = useSessionStore((s) => s.showTimerPage);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setShowButtons = useSessionStore((s) => s.setShowButtons);
  const setShowClock = useSessionStore((s) => s.setShowClock);
  const setOpenMethod = useSessionStore((s) => s.setOpenMethod);
  const setShowData = useSessionStore((s) => s.setShowData);
  const setOption = useSessionStore((s) => s.setOption);
  const setClicked = useSessionStore((s) => s.setClicked);
  const setShowTimerPage = useSessionStore((s) => s.setShowTimerPage);
  const [chosen, setChosen] = useState(false);

  const goForward = () => {
    setShowSetterPage(false);
    setShowButtons(true);
    setShowClock(true);
    setOpenMethod(false);
  };

  const goBack = () => {
    setShowSetterPage(true);
    setOpenMethod(false);
    setShowData(true);
    setChosen(false);
  };

  return (
    <div className="theRatingMethodDiv">
      <div
        className="theRatingMethod"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "360px",
          width: "360px",
          backgroundColor: "#1e212df4",
          border: "1px solid black",
        }}
      >
        <h3 style={{ marginTop: "60px", marginBottom: "20px" }}>How will you be rating your session?</h3>

        <label style={{ marginBottom: "15px", fontSize: "18px", marginRight: "15px", cursor: "pointer" }}>
          <input
            style={{ cursor: "pointer" }}
            type="radio"
            name="option"
            value="block"
            onChange={(event) => setOption(event.target.value)}
            onClick={() => setChosen(true)}
          />
          I&apos;ll be rating by block
        </label>

        <label
          style={{
            marginBottom: "20px",
            fontSize: "18px",
            marginLeft: "13px",
            marginRight: "15px",
            cursor: "pointer",
          }}
        >
          <input
            style={{ cursor: "pointer" }}
            value="session"
            name="option"
            onChange={(event) => setOption(event.target.value)}
            type="radio"
            onClick={() => setChosen(true)}
          />
          I&apos;ll be rating by session
        </label>

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

          {chosen ? (
            <button className="checkbutton" title="Start" type="button" onClick={() => goForward()}>
              <AiOutlineCheck style={{ fontSize: "42px", marginLeft: "4px" }} />
            </button>
          ) : (
            <button className="checkbutton" style={{ backgroundColor: "#1e212d" }} type="button" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingMethod;
