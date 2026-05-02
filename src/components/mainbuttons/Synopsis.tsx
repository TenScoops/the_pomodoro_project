import React, { useState } from "react";
import Modal, { type Styles } from "react-modal";
import { useSessionStore } from "../../store/sessionStore";
import "./Synopsis.css";

const Synopsis = () => {
  const setSynopsis = useSessionStore((s) => s.setSynopsis);
  const [modalOpen, setModalOpen] = useState(true);

  /* Flex centering resets react-modal defaults (absolute + 40px insets) that fight translate centering. */
  const customStyles: Styles = {
    overlay: {
      backgroundColor: "#08080b97",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(12px, 4vmin, 24px)",
      boxSizing: "border-box",
    },
    content: {
      position: "relative",
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      flex: "0 1 auto",
      margin: 0,
      transform: "none",
      padding: 0,
      border: "none",
      borderRadius: 0,
      background: "transparent",
      boxShadow: "none",
      overflow: "visible",
      outline: "none",
      width: "auto",
      maxWidth: "min(100%, calc(100vw - clamp(24px, 8vmin, 48px)))",
      maxHeight: "calc(100dvh - clamp(24px, 8vmin, 48px))",
      WebkitOverflowScrolling: "auto",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setSynopsis(false);
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
      <div className="synopsis-modal-shell">
        <div className="synopsis-panel">
          <button type="button" onClick={() => closeModal()} className="synopsis-close-btn" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="lorem">
            <p>This tool is used to actually measure your productivity and hours worked.</p>

            <h2 className="productive-header1 productive-header1--tightTop">How to Use</h2>
            <p>Rate yourself accordingly per block. Be truthful because the more truthful you are the better.</p>

            <h2 className="productive-header1">How to rate yourself</h2>
            <p>detract from your ratings if you were distracted or unfocused.</p>
            <p>In doing this, you&apos;ll see accurate trends over time in your productivity.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Synopsis;
