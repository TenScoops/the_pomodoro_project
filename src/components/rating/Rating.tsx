import React, { useState } from "react";
import Modal from "react-modal";
import PerformanceRatedToast from "../notifications/PerformanceRatedToast";
import "./Rating.css";
import { logBlockRatingForCurrentSession } from "../../services/pomoprogressService";
import { useSessionStore } from "../../store/sessionStore";

const Rating = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [showRatedToast, setShowRatedToast] = useState(false);
  const blockNum = useSessionStore((s) => s.blockNum);
  const setHasUserRated = useSessionStore((s) => s.setHasUserRated);
  const setOpenHowTo = useSessionStore((s) => s.setOpenHowTo);

  const customStyles = {
    overlay: {
      backgroundColor: "#08080b97",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#181a24",
      width: "70vmin",
      height: "70vh",
      borderRadius: "20px",
    },
  };

  const questionMark = () => {
    return (
      <button
        type="button"
        onClick={() => setOpenHowTo(true)}
        style={{ backgroundColor: "transparent", width: "42px", marginRight: "0", borderRadius: "20%" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      </button>
    );
  };

  const handleRatingClick = (score: number) => {
    setHasUserRated(true);
    setModalOpen(false);
    setShowRatedToast(true);
    window.localStorage.setItem(String(blockNum), String(score));
    void logBlockRatingForCurrentSession(blockNum, score).then((result) => {
      if (result.error) {
        console.error("Failed to log block rating", result.error);
      }
    });
  };

  const ratingOptions = () => {
    return (
      <div className="scores">
        <div className="scoreText">
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
            <h3>Rate your performance for block</h3>
            <p className="theBlockNum"> #{blockNum}</p>
          </div>
          <p className="ratePerformance">
            How to rate your performance
            {questionMark()}
          </p>
          <hr style={{ width: "400px", margin: "0" }} />
        </div>

        <div className="score" id="score10" onClick={() => handleRatingClick(10)}>
          10 - Fantastic
        </div>
        <div className="score" id="score9" onClick={() => handleRatingClick(9)}>
          9 - Great
        </div>
        <div className="score" id="score8" onClick={() => handleRatingClick(8)}>
          8 - Good
        </div>
        <div className="score" id="score7" onClick={() => handleRatingClick(7)}>
          7 - Decent
        </div>
        <div className="score" id="score6" onClick={() => handleRatingClick(6)}>
          6 - Ok
        </div>
        <div className="score" id="score5" onClick={() => handleRatingClick(5)}>
          5 - Not good
        </div>
        <div className="score" id="score4" onClick={() => handleRatingClick(4)}>
          4 - Bad
        </div>
        <div className="score" id="score3" onClick={() => handleRatingClick(3)}>
          3 - Very bad
        </div>
        <div className="score" id="score2" onClick={() => handleRatingClick(2)}>
          2 - Really bad
        </div>
        <div className="score" id="score1" onClick={() => handleRatingClick(1)}>
          1 - Terrible
        </div>
      </div>
    );
  };

  return (
    <div className="rating">
      <div className="ratingdiv">
        <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={customStyles} shouldCloseOnOverlayClick={false}>
          {ratingOptions()}
        </Modal>
        <PerformanceRatedToast
          show={showRatedToast}
          blockNumber={blockNum}
          onDismiss={() => setShowRatedToast(false)}
        />
      </div>
    </div>
  );
};

export default Rating;
