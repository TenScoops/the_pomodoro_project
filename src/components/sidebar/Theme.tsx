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
      width: "min(56vmin, 88vw)",
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
            <button type="button" onClick={() => closeModal()} className="theme-modal-close" aria-label="Close theme selection">
              x
            </button>
            <div className="scores">
              <div className="scoreText">
                <div className="rating-title-row">
                  <h3>Select a theme</h3>
                </div>
                <hr className="rating-score-divider" />
              </div>
              <div className="theme-option-grid">
                {themeChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={`theme-option-btn${theme === choice.value ? " theme-selected" : ""}`}
                    onClick={() => setTheme(choice.value)}
                  >
                    <span className="theme-option-preview" style={{ backgroundImage: `url(${choice.value})` }} aria-hidden="true" />
                    <span className="theme-option-label">{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Theme;
