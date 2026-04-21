import React, { useState } from "react";
import Modal from "react-modal";
import { THEME_CASTLE as castle, THEME_LANDSCAPE as landscape, THEME_STREETS as streets } from "../../theme/backgrounds";
import { useSessionStore } from "../../store/sessionStore";
import "../rating/Rating.css";
import "./Theme.css";

const Theme = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const theme = useSessionStore((s) => s.theme);
  const setTheme = useSessionStore((s) => s.setTheme);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);

  const customStyles = {
    overlay: {
      backgroundColor: "#07070a97",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#1b1e29cd",
      width: "min(70vmin, 96vw)",
      height: "auto",
      maxHeight: "90vh",
      borderRadius: "0",
      border: "1px solid #000",
      padding: "clamp(16px, 3vmin, 28px)",
      outline: "none",
      overflow: "auto",
      boxShadow: "7px 8px 5px 0px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setOpenThemePage(false);
  };

  const themeChoices: { id: string; label: string; value: string }[] = [
    { id: "castle", label: "Howl's Moving Castle", value: castle },
    { id: "streets", label: "Streets", value: streets },
    { id: "landscape", label: "Landscape", value: landscape },
  ];

  return (
    <div className="theme-screen">
      <div className="theme-screen__inner">
        <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
          <div className="theme-modal-inner">
            <button type="button" onClick={() => closeModal()} className="rating-help-btn theme-modal-close" aria-label="Close theme selection">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="scores">
              <div className="scoreText">
                <div className="rating-title-row">
                  <h3>Select a theme</h3>
                </div>
                <hr className="rating-score-divider" />
              </div>
              {themeChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`rating-score-btn theme-select-btn${theme === choice.value ? " theme-selected" : ""}`}
                  onClick={() => setTheme(choice.value)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Theme;
