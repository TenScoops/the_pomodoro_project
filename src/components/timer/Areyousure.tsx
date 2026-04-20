import React, { useState } from "react";
import Modal from "react-modal";
import { clearPersistedTimer } from "../../lib/timerPersistence";
import { cancelActivePomodoroSession } from "../../services/pomoprogressService";
import { useSessionStore } from "../../store/sessionStore";

const Areyousure = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const setShowParagraph = useSessionStore((s) => s.setShowParagraph);
  const setShowTimerPage = useSessionStore((s) => s.setShowTimerPage);
  const setShowButtons = useSessionStore((s) => s.setShowButtons);
  const setShowData = useSessionStore((s) => s.setShowData);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setCancelTheSession = useSessionStore((s) => s.setCancelTheSession);
  const setBlockNum = useSessionStore((s) => s.setBlockNum);
  const setShowClock = useSessionStore((s) => s.setShowClock);
  const setHasUserRated = useSessionStore((s) => s.setHasUserRated);

  const cancelSession = () => {
    clearPersistedTimer();
    void cancelActivePomodoroSession();
    setHasUserRated(false);
    setShowParagraph(true);
    setShowTimerPage(false);
    setShowButtons(false);
    setShowData(true);
    setShowSetterPage(false);
    setCancelTheSession(false);
    setBlockNum(1);
    setShowClock(false);
  };

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
      height: "180px",
      width: "330px",
      borderColor: "gray",
      borderRadius: "0",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setCancelTheSession(false);
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <p style={{ marginTop: "60px", fontSize: "16px", marginBottom: "45px" }}>Are you sure you want to cancel your session?</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button style={{ width: "40px", backgroundColor: "green", marginLeft: "25px", borderColor: "transparent" }} type="button" onClick={() => cancelSession()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>

          <button
            style={{ width: "40px", backgroundColor: "darkred", borderColor: "transparent" }}
            type="button"
            onClick={() => {
              setModalOpen(false);
              setCancelTheSession(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Areyousure;
